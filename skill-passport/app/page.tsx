"use client";

import { FormEvent, useMemo, useState } from "react";
import { analyzeProjectEvidence, buildSkillProfiles, generateRoadmap, matchRoleRequirements } from "@/lib/analysis";
import { ALL_ROLES, DEMO_CANDIDATE, DEMO_PROJECTS } from "@/lib/demo-data";
import { EvidenceType, ProjectEvidenceInput, ProjectFormState } from "@/lib/types";

type TabKey = "dashboard" | "skills" | "evidence" | "role" | "passport";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Passport home" },
  { key: "evidence", label: "Evidence vault" },
  { key: "skills", label: "Skill profile" },
  { key: "role", label: "Role fit & path" },
  { key: "passport", label: "Share passport" },
];

const EMPTY_FORM: ProjectFormState = {
  projectName: "",
  description: "",
  technologies: "",
  projectUrl: "",
  evidenceNotes: "",
  evidenceType: "GitHub repository",
  submittedAt: "",
  visibility: "Recruiters",
};

const EVIDENCE_TYPES: EvidenceType[] = [
  "GitHub repository", "Deployed project", "Project report", "Internship", "Certificate",
  "Technical assessment", "Hackathon", "Mentor verification", "Demo video", "Technical article",
];

const parseTechnologies = (text: string): string[] =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Date.now()}`;

export default function Home() {
  const [candidateName, setCandidateName] = useState(DEMO_CANDIDATE.name);
  const [candidateHeadline, setCandidateHeadline] = useState(DEMO_CANDIDATE.headline);
  const [candidateSummary, setCandidateSummary] = useState(DEMO_CANDIDATE.summary);
  const [candidateEducation, setCandidateEducation] = useState(DEMO_CANDIDATE.education ?? "");
  const [experienceLevel, setExperienceLevel] = useState(DEMO_CANDIDATE.experienceLevel ?? "Student · Early career");
  const [mainSkillsText, setMainSkillsText] = useState("React, TypeScript, Responsive UI");
  const [githubUrl, setGithubUrl] = useState(DEMO_CANDIDATE.githubUrl ?? "");
  const [projects, setProjects] = useState<ProjectEvidenceInput[]>(DEMO_PROJECTS);
  const [selectedRoleId, setSelectedRoleId] = useState(ALL_ROLES[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
  const [message, setMessage] = useState<string>("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<Record<string, string[]>>({});
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);

  const selectedRole = useMemo(
    () => ALL_ROLES.find((role) => role.id === selectedRoleId) ?? ALL_ROLES[0],
    [selectedRoleId],
  );

  const projectAnalyses = useMemo(
    () => projects.map((project) => ({ project, evidence: analyzeProjectEvidence(project) })),
    [projects],
  );

  const skillProfiles = useMemo(
    () => buildSkillProfiles(projects, selectedRole.requirements),
    [projects, selectedRole.requirements],
  );

  const roleMatchSummary = useMemo(
    () => matchRoleRequirements(selectedRole.requirements, skillProfiles),
    [selectedRole.requirements, skillProfiles],
  );

  const roadmap = useMemo(
    () => generateRoadmap(selectedRole.requirements, roleMatchSummary),
    [selectedRole.requirements, roleMatchSummary],
  );

  const acceptedEvidence = projectAnalyses.flatMap(({ project, evidence }) => evidence
    .filter((item) => project.reviewStatus === "reviewed" && (project.acceptedSkills ?? []).includes(item.skill))
    .map((item) => ({ project, item })));
  const priorityGaps = roleMatchSummary.items.filter((item) => item.matchStatus !== "Supported match").slice(0, 3);
  const selectedSkillProfile = selectedSkill ? skillProfiles.find((item) => item.skill === selectedSkill) : undefined;
  const recruiterProjects = projects.filter((project) => project.visibility !== "Private");
  const recruiterSkillProfiles = useMemo(() => buildSkillProfiles(recruiterProjects, selectedRole.requirements), [recruiterProjects, selectedRole.requirements]);
  const recruiterRoleMatchSummary = useMemo(() => matchRoleRequirements(selectedRole.requirements, recruiterSkillProfiles), [selectedRole.requirements, recruiterSkillProfiles]);

  const resetToDemo = (): void => {
    setCandidateName(DEMO_CANDIDATE.name);
    setCandidateHeadline(DEMO_CANDIDATE.headline);
    setCandidateSummary(DEMO_CANDIDATE.summary);
    setCandidateEducation(DEMO_CANDIDATE.education ?? "");
    setExperienceLevel(DEMO_CANDIDATE.experienceLevel ?? "Student · Early career");
    setMainSkillsText("React, TypeScript, Responsive UI");
    setGithubUrl(DEMO_CANDIDATE.githubUrl ?? "");
    setProjects(DEMO_PROJECTS);
    setSelectedRoleId(ALL_ROLES[0].id);
    setSelectedSuggestions({});
    setForm(EMPTY_FORM);
    setFormErrors({});
    setMessage("Demo profile reloaded.");
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ProjectFormState, string>> = {};

    if (!form.projectName.trim()) {
      errors.projectName = "Project name is required.";
    }
    if (!form.description.trim()) {
      errors.description = "Project description is required.";
    }
    if (parseTechnologies(form.technologies).length === 0) {
      errors.technologies = "Add at least one technology.";
    }
    if (form.projectUrl && !/^https?:\/\//i.test(form.projectUrl.trim())) {
      errors.projectUrl = "Project URL must start with http:// or https://";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitProject = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!validateForm()) {
      setMessage("Please fix the form errors before analyzing.");
      return;
    }

    const nextProject: ProjectEvidenceInput = {
      id: toId(),
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      technologies: parseTechnologies(form.technologies),
      projectUrl: form.projectUrl.trim() || undefined,
      evidenceNotes: form.evidenceNotes.trim() || undefined,
      evidenceType: form.evidenceType,
      submittedAt: form.submittedAt || new Date().toISOString().slice(0, 10),
      visibility: form.visibility,
      reviewStatus: "pending",
      acceptedSkills: [],
      verificationStatus: "Self-declared",
      sourceLabel: "User provided",
    };

    const suggestedSkills = analyzeProjectEvidence(nextProject).map((item) => item.skill);
    nextProject.suggestedSkills = suggestedSkills;
    setSelectedSuggestions((current) => ({ ...current, [nextProject.id]: suggestedSkills }));
    setProjects((current) => [nextProject, ...current]);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActiveTab("evidence");
    setMessage("Evidence received. Review the demo analyzer’s skill suggestions before adding them to your passport.");
  };

  const reviewEvidence = (projectId: string, accepted: string[]): void => {
    setProjects((current) => current.map((project) => project.id === projectId
      ? { ...project, reviewStatus: "reviewed", acceptedSkills: accepted, verificationStatus: "AI-supported" }
      : project));
    setMessage(accepted.length
      ? `${accepted.length} candidate-approved skill${accepted.length === 1 ? "" : "s"} added as AI-supported evidence.`
      : "Suggestions rejected. No new skills were added to your passport.");
  };

  const toggleSuggestion = (projectId: string, skill: string): void => {
    setSelectedSuggestions((current) => {
      const project = projects.find((item) => item.id === projectId);
      const selected = current[projectId] ?? project?.acceptedSkills ?? project?.suggestedSkills ?? [];
      return {
        ...current,
        [projectId]: selected.includes(skill) ? selected.filter((item) => item !== skill) : [...selected, skill],
      };
    });
  };

  const copyPassport = async (): Promise<void> => {
    const passportText = [
      `SkillPassport — Skills You Can Prove`,
      `Candidate: ${candidateName}`,
      `Headline: ${candidateHeadline}`,
      `Summary: ${candidateSummary}`,
      `Education: ${candidateEducation}`,
      `Experience: ${experienceLevel}`,
      `Portfolio: ${githubUrl || "Not supplied"}`,
      "",
      `Target Role: ${selectedRole.title}`,
      `Role match: ${recruiterRoleMatchSummary.readinessScore}%`,
      recruiterRoleMatchSummary.formula,
      "",
      "AI-supported skills (demo text analysis; not independently verified):",
      ...recruiterSkillProfiles
        .map((skill) => `- ${skill.skill} (${skill.confidenceScore}% signal): ${skill.explanation}`),
      "",
      "Skills Needing More Evidence:",
      ...recruiterSkillProfiles
        .filter((skill) => skill.evidenceStatus !== "Evidence found")
        .map((skill) => `- ${skill.skill}: ${skill.evidenceStatus}. ${skill.reviewNotes}`),
      "",
      "Role Gaps and Next Evidence:",
      ...recruiterRoleMatchSummary.items.map(
        (item) => `- ${item.requiredSkill}: ${item.matchStatus}. Next evidence: ${item.nextEvidence}`,
      ),
    ].join("\n");

    try {
      await navigator.clipboard.writeText(passportText);
      setMessage("Passport copied to clipboard.");
    } catch {
      setMessage("Copy failed in this browser context. You can still print/save as PDF.");
    }
  };

  const printPassport = (): void => {
    window.print();
  };

  return (
    <div className="app-shell min-h-screen bg-slate-50 text-slate-900">
      <header className="sidebar no-print">
        <div className="sidebar-brand">
          <div className="brand-symbol" aria-hidden="true">S<span>+</span></div>
          <div><p className="brand-name">skill<span>passport</span></p><p className="brand-caption">PROOF, NOT PROMISES</p></div>
        </div>
        <div className="sidebar-intro">
          <p className="eyebrow">YOUR WORKSPACE</p>
          <h1>Make your skills<br />speak for themselves.</h1>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="eyebrow nav-caption">PORTFOLIO</p>
          {TABS.map((tab, index) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              aria-current={activeTab === tab.key ? "page" : undefined}
              className={`nav-item ${activeTab === tab.key ? "is-active" : ""}`}
            >
              <span className="nav-number">0{index + 1}</span><span>{tab.label}</span>
              {activeTab === tab.key && <span className="nav-arrow" aria-hidden="true">↗</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-note">Your profile is built from projects, with every skill tied back to its evidence.</p>
          <div className="sidebar-actions">
              <button
                type="button"
                onClick={resetToDemo}
                className="quiet-button"
              >
                ↻ &nbsp; Reset demo profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setProjects([]);
                  setMessage("Projects cleared. Add project evidence to continue.");
                }}
                className="quiet-button"
              >
                Clear projects
              </button>
          </div>
        </div>
      </header>

      <main className="workspace mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="workspace-topline no-print">
          <p><span className="live-dot" /> DEMO PROFILE <span className="topline-divider">/</span> {projects.length} EVIDENCE ITEM{projects.length === 1 ? "" : "S"}</p>
          <span className="topline-date">EVIDENCE · ROLE FIT · NEXT STEPS</span>
        </div>

        <details className="profile-editor-wrap no-print" open={profileEditorOpen} onToggle={(event) => setProfileEditorOpen(event.currentTarget.open)}>
          <summary>Set up your candidate passport <span>Name, education, experience, skills, and target role</span></summary>
          <section className="profile-editor grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-3">
          <label className="grid gap-1 text-sm">
            Candidate Name
            <input
              value={candidateName}
              onChange={(event) => setCandidateName(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Candidate Headline
            <input
              value={candidateHeadline}
              onChange={(event) => setCandidateHeadline(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Target Role
            <select
              value={selectedRole.id}
              onChange={(event) => setSelectedRoleId(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              {ALL_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </label>
          <label className="md:col-span-3 grid gap-1 text-sm">
            Professional Summary
            <textarea
              value={candidateSummary}
              onChange={(event) => setCandidateSummary(event.target.value)}
              rows={3}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">Education<input value={candidateEducation} onChange={(event) => setCandidateEducation(event.target.value)} placeholder="Degree · institution" /></label>
          <label className="grid gap-1 text-sm">Experience level<select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)}><option>Student · Early career</option><option>Entry level</option><option>1–3 years</option><option>3+ years</option></select></label>
          <label className="grid gap-1 text-sm">GitHub / portfolio URL<input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/you" /></label>
          <label className="md:col-span-3 grid gap-1 text-sm">Main skills you want to claim<input value={mainSkillsText} onChange={(event) => setMainSkillsText(event.target.value)} placeholder="React, SQL, communication" /><span className="text-xs text-slate-500">These remain self-declared until you connect evidence.</span></label>
          </section>
        </details>

        {message && (
          <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800 no-print">
            {message}
          </p>
        )}

        {activeTab === "dashboard" && (
          <section className="dashboard-view grid gap-5">
            <div className="dashboard-heading">
              <div><p className="eyebrow">SKILL PASSPORT / CANDIDATE VIEW</p><h2>Build a profile backed by proof.</h2><p>Your work is the story. Every skill on this passport points to evidence you can review and share.</p></div>
              <button type="button" className="primary-button" onClick={() => setActiveTab("evidence")}>＋ Add evidence <span>↗</span></button>
            </div>

            <article className="candidate-cover rounded-xl border border-slate-200 bg-white p-5">
              <div className="candidate-identity">
                <div className="candidate-avatar">{candidateName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "SP"}</div>
                <div><p className="eyebrow">CANDIDATE PASSPORT</p><h2>{candidateName || "Your name"}</h2><p className="candidate-headline">{candidateHeadline || "Add a professional headline"}</p><p className="candidate-meta">{candidateEducation || "Education not added"} <span>·</span> {experienceLevel}</p></div>
              </div>
              <p className="candidate-summary">{candidateSummary || "Add a short summary about the work you do and the skills you want to demonstrate."}</p>
              <div className="candidate-controls">
                <label>Target role<select value={selectedRole.id} onChange={(event) => setSelectedRoleId(event.target.value)}>{ALL_ROLES.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}</select></label>
                <div className="candidate-match"><span className="readiness-ring"><span>{roleMatchSummary.readinessScore}%</span><small>ROLE MATCH</small></span><span><strong>{selectedRole.title}</strong><small>{roleMatchSummary.supportedCount} strong · {roleMatchSummary.partialCount} partial · {roleMatchSummary.gapCount} gaps</small></span></div>
              </div>
              <div className="cover-actions"><button type="button" className="text-link" onClick={() => setActiveTab("passport")}>Preview shareable passport ↗</button><button type="button" className="text-link" onClick={() => { setProfileEditorOpen(true); document.querySelector(".profile-editor-wrap")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>Edit candidate profile ↗</button>{githubUrl && /^https?:\/\//i.test(githubUrl) && <a href={githubUrl} target="_blank" rel="noreferrer" className="text-link">Open portfolio ↗</a>}</div>
            </article>

            <div className="home-columns">
              <article className="evidence-panel rounded-xl border border-slate-200 bg-white p-5">
                <div className="panel-heading"><div><p className="eyebrow">PROOF IN YOUR PASSPORT</p><h2>Skills connected to evidence</h2></div><button type="button" className="text-link" onClick={() => setActiveTab("skills")}>Open skill profile ↗</button></div>
                {acceptedEvidence.length ? <div className="home-skill-list">{skillProfiles.filter((skill) => skill.evidenceItems.length > 0).slice(0, 5).map((skill) => <button className="home-skill-row" type="button" key={skill.skill} onClick={() => { setSelectedSkill(skill.skill); setActiveTab("skills"); }}><span className="skill-mark">✓</span><span className="home-skill-copy"><strong>{skill.skill}</strong><small>{skill.evidenceItems.length} supporting item{skill.evidenceItems.length === 1 ? "" : "s"} · {skill.proficiencyEstimate}</small></span><span className="verification-pill">AI-supported</span><span className="row-arrow">↗</span></button>)}</div> : <div className="empty-proof"><strong>No skills supported yet.</strong><p>Add a project, review its suggested skills, and choose what belongs on your passport.</p><button type="button" className="text-link" onClick={() => setActiveTab("evidence")}>Add your first evidence ↗</button></div>}
                <p className="trust-note">AI-supported means the demo analyzer found a signal in submitted text. It is not independent or human verification.</p>
              </article>

              <article className="gap-panel rounded-xl border border-slate-200 bg-white p-5">
                <div className="panel-heading"><div><p className="eyebrow">A CLEAR NEXT MOVE</p><h2>What to strengthen</h2></div><button type="button" className="text-link" onClick={() => setActiveTab("role")}>Role fit ↗</button></div>
                <p className="gap-context">For <strong>{selectedRole.title}</strong></p>
                {priorityGaps.length ? <div className="gap-list">{priorityGaps.map((item) => <div className="gap-row" key={item.requiredSkill}><span className={item.matchStatus === "Gap" ? "gap-dot missing" : "gap-dot partial"} /><div><strong>{item.requiredSkill}</strong><small>{item.matchStatus === "Gap" ? "No supporting evidence yet" : "More specific evidence would help"}</small></div></div>)}</div> : <p className="empty-proof">All current role requirements have supporting evidence. Keep adding recent work.</p>}
                <button type="button" className="next-action" onClick={() => setActiveTab(priorityGaps.length ? "role" : "evidence")}>{priorityGaps.length ? `Plan next step · ${priorityGaps[0].requiredSkill}` : "Add recent evidence"}<span>↗</span></button>
              </article>
            </div>

            <article className="evidence-panel rounded-xl border border-slate-200 bg-white p-5">
              <div className="panel-heading"><div><p className="eyebrow">RECENT WORK</p><h2>Evidence vault</h2></div><button type="button" className="text-link" onClick={() => setActiveTab("evidence")}>Manage evidence ↗</button></div>
              <div className="recent-evidence">{projects.filter((project) => project.visibility !== "Private").slice(0, 3).map((project) => <div className="recent-evidence-row" key={project.id}><span className="evidence-type-mark">{project.evidenceType === "GitHub repository" ? "GH" : "EV"}</span><div><strong>{project.projectName}</strong><small>{project.evidenceType ?? "Project evidence"} · {project.submittedAt ?? "Date not supplied"}</small></div><span className={project.reviewStatus === "reviewed" ? "status-tag" : "status-tag pending"}>{project.reviewStatus === "reviewed" ? "Reviewed" : "Review needed"}</span></div>)}</div>
            </article>
          </section>
        )}

        {activeTab === "skills" && (
          <section className="skill-profile-view">
            <div className="dashboard-heading"><div><p className="eyebrow">CLAIMS, CONNECTED TO WORK</p><h2>Your skill profile</h2><p>Open a skill to see the exact project evidence behind it. Candidate-approved suggestions are still AI-supported, not verified.</p></div><button type="button" className="primary-button" onClick={() => setActiveTab("evidence")}>＋ Add evidence <span>↗</span></button></div>
            {parseTechnologies(mainSkillsText).filter((name) => !skillProfiles.some((skill) => skill.skill.toLowerCase() === name.toLowerCase())).length > 0 && <div className="self-declared-block"><p className="eyebrow">SELF-DECLARED · NEEDS EVIDENCE</p><div className="self-declared-list">{parseTechnologies(mainSkillsText).filter((name) => !skillProfiles.some((skill) => skill.skill.toLowerCase() === name.toLowerCase())).map((name) => <span key={name}>{name}<small>Self-declared</small></span>)}</div><p>These are candidate claims and do not count toward role matching until supporting evidence is accepted.</p></div>}
            <div className="skill-card-grid">{skillProfiles.map((skill) => { const selfDeclared = parseTechnologies(mainSkillsText).some((name) => name.toLowerCase() === skill.skill.toLowerCase()); return <button type="button" key={skill.skill} className={`skill-card ${selectedSkill === skill.skill ? "selected" : ""}`} onClick={() => setSelectedSkill(skill.skill)}><div className="skill-card-top"><span className="skill-category">{skill.category}</span><span className={skill.evidenceItems.length ? "verification-pill" : "unproven-pill"}>{skill.evidenceItems.length ? "AI-supported" : selfDeclared ? "Self-declared" : skill.evidenceStatus === "Needs review" ? "Needs review" : "No evidence"}</span></div><h3>{skill.skill}</h3><p className="skill-level">{skill.evidenceStatus === "Evidence found" ? "Applied in project context" : skill.evidenceStatus === "Needs review" ? "Early signal · needs more proof" : selfDeclared ? "Candidate claim · not matched" : "Not supported by supplied evidence"}</p><div className="skill-card-meta"><span>{skill.evidenceItems.length} evidence item{skill.evidenceItems.length === 1 ? "" : "s"}</span><span>{skill.confidenceScore ? `Signal ${skill.confidenceScore}%` : "No signal yet"}</span><span>Latest: {skill.lastUsed}</span></div><span className="skill-card-link">Inspect evidence ↗</span></button>; })}</div>
            {selectedSkillProfile && <article className="skill-detail rounded-xl border border-slate-200 bg-white p-5"><div className="panel-heading"><div><p className="eyebrow">EVIDENCE TRACE</p><h2>{selectedSkillProfile.skill}</h2></div><button type="button" className="text-link" onClick={() => setSelectedSkill(null)}>Close ×</button></div><p className="skill-detail-explanation">{selectedSkillProfile.explanation} {selectedSkillProfile.evidenceItems.length > 0 && `Signal estimate: ${selectedSkillProfile.confidenceScore}%, based on matching terms in supplied materials.`}</p>{selectedSkillProfile.evidenceItems.length ? <div className="supporting-evidence">{selectedSkillProfile.evidenceItems.map((item, index) => <div className="supporting-item" key={`${item.supportingProject}-${index}`}><div><strong>{item.supportingProject}</strong><span>{item.evidenceSource} · {item.submittedAt ?? "Date not supplied"}</span></div><p>{item.explanation}</p><small>{item.reference}</small></div>)}</div> : <div className="empty-proof"><strong>This role skill has no supporting evidence yet.</strong><p>{selectedSkillProfile.reviewNotes}</p><button type="button" className="text-link" onClick={() => setActiveTab("evidence")}>Add evidence for {selectedSkillProfile.skill} ↗</button></div>}</article>}
          </section>
        )}

        {activeTab === "evidence" && (
          <section className="evidence-vault">
            <div className="dashboard-heading"><div><p className="eyebrow">EVIDENCE VAULT / CANDIDATE-CONTROLLED VISIBILITY</p><h2>Show the work behind the claim.</h2><p>Add a project or learning artifact. Review each suggested skill before it contributes to your passport.</p></div></div>
            <div className="vault-layout">
              <article className="vault-form rounded-xl border border-slate-200 bg-white p-5 no-print">
                <p className="eyebrow">NEW EVIDENCE</p><h3>Add an artifact</h3>
                <p className="vault-explainer">The demo analyzer reads only the text you enter here. It does not open GitHub links, inspect files, or verify credentials.</p>
                <form onSubmit={submitProject} className="mt-4 grid gap-3">
                  <label className="grid gap-1 text-sm">Evidence title *<input value={form.projectName} onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))} placeholder="e.g. Dockerised Java REST API" />{formErrors.projectName && <span className="text-xs text-rose-700">{formErrors.projectName}</span>}</label>
                  <label className="grid gap-1 text-sm">Evidence type<select value={form.evidenceType} onChange={(event) => setForm((current) => ({ ...current, evidenceType: event.target.value as EvidenceType }))}>{EVIDENCE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
                  <label className="grid gap-1 text-sm">What did you build or do? *<textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Describe your contribution and the technical work involved." />{formErrors.description && <span className="text-xs text-rose-700">{formErrors.description}</span>}</label>
                  <label className="grid gap-1 text-sm">Related skills or tools *<input value={form.technologies} onChange={(event) => setForm((current) => ({ ...current, technologies: event.target.value }))} placeholder="Java, Docker, PostgreSQL" />{formErrors.technologies && <span className="text-xs text-rose-700">{formErrors.technologies}</span>}</label>
                  <label className="grid gap-1 text-sm">Evidence link (optional)<input type="url" value={form.projectUrl} onChange={(event) => setForm((current) => ({ ...current, projectUrl: event.target.value }))} placeholder="https://github.com/you/project" />{formErrors.projectUrl && <span className="text-xs text-rose-700">{formErrors.projectUrl}</span>}</label>
                  <div className="form-pair"><label className="grid gap-1 text-sm">Last used / evidence date<input type="date" value={form.submittedAt} onChange={(event) => setForm((current) => ({ ...current, submittedAt: event.target.value }))} /></label><label className="grid gap-1 text-sm">Visibility<select value={form.visibility} onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as "Recruiters" | "Private" }))}><option>Recruiters</option><option>Private</option></select></label></div>
                  <label className="grid gap-1 text-sm">Evidence details or excerpts<textarea rows={3} value={form.evidenceNotes} onChange={(event) => setForm((current) => ({ ...current, evidenceNotes: event.target.value }))} placeholder="Specific implementation details, outcomes, or what to inspect." /></label>
                  <button type="submit" className="primary-button analyze-button">Analyze evidence <span>↗</span></button>
                  <p className="form-footnote">Demo analysis is deterministic keyword matching. Signal confidence is a simple heuristic, not a calibrated AI confidence. Suggestions are not added until you approve them.</p>
                </form>
              </article>

              <div className="vault-results">
                {projectAnalyses.length === 0 && <article className="empty-proof"><strong>Your evidence vault is ready.</strong><p>Add a repository, deployed project, certificate, internship, or another artifact to start connecting skills to proof.</p></article>}
                {projectAnalyses.map(({ project, evidence }) => {
                  const chosen = selectedSuggestions[project.id] ?? project.acceptedSkills ?? project.suggestedSkills ?? [];
                  const previous = project.acceptedSkills ?? [];
                  const hasChanges = [...chosen].sort().join("|") !== [...previous].sort().join("|");
                  return <article key={project.id} className="vault-item rounded-xl border border-slate-200 bg-white p-5">
                    <div className="vault-item-heading"><div><span className="evidence-type-mark">{project.evidenceType === "GitHub repository" ? "GH" : "EV"}</span></div><div className="vault-item-title"><p className="eyebrow">{project.evidenceType ?? "Project evidence"} · {project.submittedAt ?? "Date not supplied"}</p><h3>{project.projectName}</h3></div><button type="button" className="remove-evidence" aria-label={`Remove ${project.projectName}`} onClick={() => setProjects((current) => current.filter((item) => item.id !== project.id))}>×</button></div>
                    <p className="vault-description">{project.description}</p>
                    <div className="artifact-meta"><span>Related: {(project.technologies ?? []).join(", ") || "Not specified"}</span><span>Visibility: {project.visibility ?? "Recruiters"}</span>{project.projectUrl && <a href={project.projectUrl} target="_blank" rel="noreferrer">Open submitted link ↗</a>}</div>
                    {project.evidenceNotes && <p className="evidence-notes">Candidate notes: {project.evidenceNotes}</p>}
                    <div className="analysis-steps">{["Evidence received", "Potential skills detected", "Mapped to this artifact", project.reviewStatus === "reviewed" ? "Candidate reviewed" : "Your review"].map((step, index) => <div className={index < 3 || project.reviewStatus === "reviewed" ? "analysis-step complete" : "analysis-step current"} key={step}><span>{index < 3 || project.reviewStatus === "reviewed" ? "✓" : "0" + (index + 1)}</span>{step}</div>)}</div>
                    {evidence.length ? <><p className="suggestions-heading">Suggested skills <span>Choose which suggestions to add</span></p><div className="suggestion-list">{evidence.map((item) => <label className="suggestion-row" key={item.skill}><input type="checkbox" checked={chosen.includes(item.skill)} onChange={() => toggleSuggestion(project.id, item.skill)} /><span className="suggestion-main"><strong>{item.skill}</strong><small>{item.explanation}</small><small>Matched terms: {item.triggers.join(", ")}</small></span><span className="signal-score">{item.confidenceScore}%<small>signal</small></span></label>)}</div>{(project.reviewStatus !== "reviewed" || hasChanges) && <div className="review-actions"><button type="button" className="primary-button" onClick={() => reviewEvidence(project.id, chosen)}>{project.reviewStatus === "reviewed" ? "Update skill mapping" : `Add ${chosen.length} selected skill${chosen.length === 1 ? "" : "s"}`}<span>↗</span></button><button type="button" className="text-link" onClick={() => reviewEvidence(project.id, [])}>Reject suggestions</button></div>}{project.reviewStatus === "reviewed" && !hasChanges && <p className="reviewed-note">Candidate reviewed · {previous.length ? `${previous.length} AI-supported skill${previous.length === 1 ? "" : "s"} on passport` : "No suggestions accepted"}</p>}</> : <div className="no-signals"><strong>No configured skill signal found.</strong><p>Add more detail about the tools, methods, or outcomes used. The demo analyzer can only match its local skill library.</p></div>}
                  </article>;
                })}
              </div>
            </div>
          </section>
        )}

        {activeTab === "role" && (
          <section className="role-fit-view">
            <div className="dashboard-heading"><div><p className="eyebrow">ROLE FIT / DETERMINISTIC MATCH</p><h2>See where your proof fits.</h2><p>Compare accepted evidence with the requirements of a role. High-priority skills count twice; a partial signal receives half credit.</p></div><select className="role-selector" value={selectedRole.id} onChange={(event) => setSelectedRoleId(event.target.value)}>{ALL_ROLES.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}</select></div>
            <article className="role-score-card rounded-xl border border-slate-200 bg-white p-5"><div><p className="eyebrow">CURRENT TARGET</p><h3>{selectedRole.title}</h3><p>{selectedRole.summary}</p><small>{roleMatchSummary.formula}</small></div><div className="role-score"><strong>{roleMatchSummary.readinessScore}%</strong><span>evidence match</span></div></article>
            <div className="match-counts"><span className="match-count strong">{roleMatchSummary.supportedCount} strong matches</span><span className="match-count partial">{roleMatchSummary.partialCount} partial matches</span><span className="match-count gap">{roleMatchSummary.gapCount} gaps</span></div>
            <div className="role-requirements">{roleMatchSummary.items.map((item) => { const requirement = selectedRole.requirements.find((entry) => entry.skill === item.requiredSkill); const profile = skillProfiles.find((entry) => entry.skill === item.requiredSkill); return <article className="requirement-card rounded-xl border border-slate-200 bg-white p-5" key={item.requiredSkill}><div className="requirement-heading"><div><span className="eyebrow">{requirement?.priority ?? "MEDIUM"} PRIORITY</span><h3>{item.requiredSkill}</h3></div><span className={`requirement-status ${item.matchStatus === "Supported match" ? "supported" : item.matchStatus === "Gap" ? "gap" : "partial"}`}>{item.matchStatus === "Supported match" ? "Strong match" : item.matchStatus === "Gap" ? "Gap" : "Needs more evidence"}</span></div><p>{item.explanation}</p>{profile?.evidenceItems.length ? <button type="button" className="text-link" onClick={() => { setSelectedSkill(item.requiredSkill); setActiveTab("skills"); }}>View {profile.evidenceItems.length} supporting item{profile.evidenceItems.length === 1 ? "" : "s"} ↗</button> : <div className="next-evidence"><strong>Evidence that would help</strong><span>{item.nextEvidence}</span></div>}</article>; })}</div>
            <article className="roadmap-panel rounded-xl border border-slate-200 bg-white p-5"><div className="panel-heading"><div><p className="eyebrow">PERSONALISED FROM YOUR ROLE GAPS</p><h2>Your next evidence plan</h2></div></div>{roadmap.length ? <div className="roadmap-list">{roadmap.slice(0, 3).map((task) => <div className="roadmap-item" key={task.skill}><span className="roadmap-number">0{task.priorityOrder}</span><div><strong>{task.skill} · {task.priorityLabel} priority</strong><p>{task.practiceTask}</p><small>Save as evidence: {task.expectedEvidence}</small></div></div>)}</div> : <p className="empty-proof">Every current role requirement has supporting evidence. Keep your passport current with recent work.</p>}<button type="button" className="text-link roadmap-cta" onClick={() => setActiveTab("evidence")}>Add evidence for a gap ↗</button></article>
          </section>
        )}

        {activeTab === "passport" && (
          <section id="passport-view" className="grid gap-4">
            <article className="rounded-xl border border-slate-200 bg-white p-6 print-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">SKILLPASSPORT · CANDIDATE PROOF</p>
                  <h2 className="text-2xl font-bold text-slate-900">{candidateName}</h2>
                  <p className="text-sm text-slate-600">{candidateHeadline}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Target Role: {selectedRole.title}</p>
                  <p>Role match: {recruiterRoleMatchSummary.readinessScore}%</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-700">{candidateSummary}</p>
              <p className="mt-2 text-sm text-slate-600">{candidateEducation} · {experienceLevel}</p>
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">AI-supported means a deterministic demo analyzer found a text signal in candidate-submitted material. Links are not fetched and this is not official, mentor, or assessment verification.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Projects</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {recruiterProjects.map((project) => (
                      <li key={project.id} className="rounded-lg border border-slate-200 p-2">
                        <p className="font-medium">{project.projectName}</p>
                        <p className="text-xs text-slate-500">{project.evidenceType} · {project.submittedAt ?? "Date not supplied"} · {project.reviewStatus === "reviewed" ? "Candidate reviewed" : "Awaiting review"}</p>
                      </li>
                    ))}
                    {!recruiterProjects.length && <li className="rounded-lg border border-dashed border-slate-300 p-3 text-xs">No evidence is currently visible to recruiters.</li>}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">AI-supported skills</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {recruiterSkillProfiles.map((skill) => (
                        <li key={skill.skill} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                          <p className="font-medium">{skill.skill} · signal {skill.confidenceScore}%</p>
                          <p className="text-xs">Supported by {skill.evidenceItems.map((item) => item.supportingProject).join(", ")}</p>
                        </li>
                      ))}
                    {!recruiterSkillProfiles.length && <li className="rounded-lg border border-dashed border-slate-300 p-3 text-xs">No recruiter-visible skills have been connected to evidence.</li>}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Role skills without strong evidence</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {recruiterRoleMatchSummary.items
                      .filter((item) => item.matchStatus !== "Supported match")
                      .map((skill) => (
                        <li key={skill.requiredSkill} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                          <p className="font-medium">
                            {skill.requiredSkill} — {skill.matchStatus}
                          </p>
                          <p className="text-xs">Next evidence: {skill.nextEvidence}</p>
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Role gap summary</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {recruiterRoleMatchSummary.items.map((item) => (
                      <li key={item.requiredSkill} className="rounded-lg border border-slate-200 p-2">
                        <p className="font-medium">{item.requiredSkill}</p>
                        <p className="text-xs">
                          {item.matchStatus}. Next: {item.nextEvidence}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <div className="flex flex-wrap gap-3 no-print">
              <button
                type="button"
                onClick={copyPassport}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Copy Passport
              </button>
              <button
                type="button"
                onClick={printPassport}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Print / Save as PDF
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
