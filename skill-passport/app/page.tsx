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

const MATCH_CIRCUMFERENCE = 263.9;
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatEvidenceDate = (value?: string): string => {
  if (!value) return "Date not supplied";
  const [year, month] = value.split("-");
  const label = MONTH_LABELS[Number(month) - 1];
  return year && label ? `${label} ${year}` : value;
};

function RoleMatchMedallion({ score }: { score: number }) {
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div className="role-match-medallion" role="img" aria-label={`${safeScore}% role match`}>
      <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <circle className="role-match-track" cx="50" cy="50" r="42" />
        <circle
          className="role-match-progress"
          cx="50"
          cy="50"
          r="42"
          style={{
            strokeDasharray: MATCH_CIRCUMFERENCE,
            strokeDashoffset: MATCH_CIRCUMFERENCE * (1 - safeScore / 100),
          }}
        />
      </svg>
      <span className="role-match-value"><strong>{safeScore}<sup>%</sup></strong><small>role match</small></span>
    </div>
  );
}

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
  const recruiterProjects = useMemo(
    () => projects.filter((project) => project.visibility !== "Private" && project.reviewStatus === "reviewed"),
    [projects],
  );
  const recruiterSkillProfiles = useMemo(
    () => buildSkillProfiles(recruiterProjects, selectedRole.requirements),
    [recruiterProjects, selectedRole.requirements],
  );
  const recruiterRoleMatchSummary = useMemo(
    () => matchRoleRequirements(selectedRole.requirements, recruiterSkillProfiles),
    [selectedRole.requirements, recruiterSkillProfiles],
  );
  const passportSkillProfiles = recruiterSkillProfiles.filter((skill) => skill.evidenceItems.length > 0);
  const passportRoleNeeds = recruiterRoleMatchSummary.items.filter((item) => item.matchStatus !== "Supported match");

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
      "Skills supported by candidate-reviewed evidence (demo text analysis; not independently verified):",
      ...passportSkillProfiles
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
          <summary><span className="setup-step-number">01</span><span className="setup-summary-copy"><strong>Start your candidate passport</strong><span>Set the story, role, and initial claims your evidence will support</span></span></summary>
          <section className="profile-editor">
            <div className="profile-editor-intro">
              <p className="eyebrow">CANDIDATE SETUP</p>
              <h2>Give your evidence a direction.</h2>
              <p>Start with the context a recruiter needs. Your skills become stronger only after you connect them to concrete work.</p>
            </div>
            <div className="profile-form-grid">
              <label className="profile-field">
                Candidate name
                <input value={candidateName} onChange={(event) => setCandidateName(event.target.value)} />
              </label>
              <label className="profile-field">
                Professional headline
                <input value={candidateHeadline} onChange={(event) => setCandidateHeadline(event.target.value)} />
              </label>
              <label className="profile-field">
                Target role
                <select value={selectedRole.id} onChange={(event) => setSelectedRoleId(event.target.value)}>
                  {ALL_ROLES.map((role) => <option key={role.id} value={role.id}>{role.title}</option>)}
                </select>
              </label>
              <label className="profile-field profile-field-wide">
                Professional summary
                <textarea value={candidateSummary} onChange={(event) => setCandidateSummary(event.target.value)} rows={3} />
              </label>
              <label className="profile-field">Education<input value={candidateEducation} onChange={(event) => setCandidateEducation(event.target.value)} placeholder="Degree · institution" /></label>
              <label className="profile-field">Experience level<select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)}><option>Student · Early career</option><option>Entry level</option><option>1–3 years</option><option>3+ years</option></select></label>
              <label className="profile-field">GitHub / portfolio URL<input type="url" value={githubUrl} onChange={(event) => setGithubUrl(event.target.value)} placeholder="https://github.com/you" /></label>
              <label className="profile-field profile-field-wide">Main skills you want to claim<input value={mainSkillsText} onChange={(event) => setMainSkillsText(event.target.value)} placeholder="React, SQL, communication" /></label>
            </div>
            <p className="profile-claim-note"><span aria-hidden="true">✦</span><span><strong>Claims begin as self-declared.</strong> Add a project, review the suggested skills, and choose which evidence belongs on your passport.</span></p>
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
                <div className="candidate-match">
                  <RoleMatchMedallion score={roleMatchSummary.readinessScore} />
                  <div className="candidate-match-copy">
                    <strong>{selectedRole.title}</strong>
                    <small>{roleMatchSummary.supportedCount} supported · {roleMatchSummary.partialCount} partial · {roleMatchSummary.gapCount} gaps</small>
                  </div>
                </div>
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
            <article className="role-score-card rounded-xl border border-slate-200 bg-white p-5"><div><p className="eyebrow">CURRENT TARGET</p><h3>{selectedRole.title}</h3><p>{selectedRole.summary}</p><small>{roleMatchSummary.formula}</small></div><RoleMatchMedallion score={roleMatchSummary.readinessScore} /></article>
            <div className="match-counts"><span className="match-count strong">{roleMatchSummary.supportedCount} strong matches</span><span className="match-count partial">{roleMatchSummary.partialCount} partial matches</span><span className="match-count gap">{roleMatchSummary.gapCount} gaps</span></div>
            <div className="role-requirements">{roleMatchSummary.items.map((item) => { const requirement = selectedRole.requirements.find((entry) => entry.skill === item.requiredSkill); const profile = skillProfiles.find((entry) => entry.skill === item.requiredSkill); return <article className="requirement-card rounded-xl border border-slate-200 bg-white p-5" key={item.requiredSkill}><div className="requirement-heading"><div><span className="eyebrow">{requirement?.priority ?? "MEDIUM"} PRIORITY</span><h3>{item.requiredSkill}</h3></div><span className={`requirement-status ${item.matchStatus === "Supported match" ? "supported" : item.matchStatus === "Gap" ? "gap" : "partial"}`}>{item.matchStatus === "Supported match" ? "Strong match" : item.matchStatus === "Gap" ? "Gap" : "Needs more evidence"}</span></div><p>{item.explanation}</p>{profile?.evidenceItems.length ? <button type="button" className="text-link" onClick={() => { setSelectedSkill(item.requiredSkill); setActiveTab("skills"); }}>View {profile.evidenceItems.length} supporting item{profile.evidenceItems.length === 1 ? "" : "s"} ↗</button> : <div className="next-evidence"><strong>Evidence that would help</strong><span>{item.nextEvidence}</span></div>}</article>; })}</div>
            <article className="roadmap-panel rounded-xl border border-slate-200 bg-white p-5"><div className="panel-heading"><div><p className="eyebrow">PERSONALISED FROM YOUR ROLE GAPS</p><h2>Your next evidence plan</h2></div></div>{roadmap.length ? <div className="roadmap-list">{roadmap.slice(0, 3).map((task) => <div className="roadmap-item" key={task.skill}><span className="roadmap-number">0{task.priorityOrder}</span><div><strong>{task.skill} · {task.priorityLabel} priority</strong><p>{task.practiceTask}</p><small>Save as evidence: {task.expectedEvidence}</small></div></div>)}</div> : <p className="empty-proof">Every current role requirement has supporting evidence. Keep your passport current with recent work.</p>}<button type="button" className="text-link roadmap-cta" onClick={() => setActiveTab("evidence")}>Add evidence for a gap ↗</button></article>
          </section>
        )}

        {activeTab === "passport" && (
          <section id="passport-view" className="passport-share">
            <div className="passport-toolbar no-print">
              <div>
                <p className="eyebrow">RECRUITER VIEW / CANDIDATE CONTROLLED</p>
                <h2>Share the evidence, not just a claim.</h2>
                <p>Only evidence the candidate reviewed and chose to share appears in this record.</p>
              </div>
              <p className="passport-toolbar-count"><strong>{recruiterProjects.length}</strong><span>reviewed source{recruiterProjects.length === 1 ? "" : "s"}<br />included here</span></p>
            </div>

            <article className="passport-document print-card">
              <header className="passport-document-header">
                <div>
                  <p className="passport-wordmark">skill<span>passport</span></p>
                  <p className="passport-document-type">Evidence passport · candidate review snapshot</p>
                </div>
                <p className="passport-record-label"><span>SHAREABLE RECORD</span><strong>Candidate-controlled</strong></p>
              </header>

              <section className="passport-identity">
                <div className="passport-identity-copy">
                  <p className="passport-section-kicker">CANDIDATE</p>
                  <h2>{candidateName || "Your name"}</h2>
                  <p className="passport-headline">{candidateHeadline || "Add a professional headline"}</p>
                  <p className="passport-bio">{candidateSummary || "Add a concise account of the work you do and the skills you want to demonstrate."}</p>
                  <dl className="passport-facts">
                    <div><dt>Education</dt><dd>{candidateEducation || "Not supplied"}</dd></div>
                    <div><dt>Experience</dt><dd>{experienceLevel || "Not supplied"}</dd></div>
                    {githubUrl && /^https?:\/\//i.test(githubUrl) && <div><dt>Portfolio</dt><dd><a href={githubUrl} target="_blank" rel="noreferrer">Open submitted link ↗</a></dd></div>}
                  </dl>
                </div>
                <aside className="passport-role-panel">
                  <p>ROLE IN VIEW</p>
                  <h3>{selectedRole.title}</h3>
                  <div className="passport-role-score"><strong>{recruiterRoleMatchSummary.readinessScore}<small>%</small></strong><span>evidence match</span></div>
                  <p>{recruiterRoleMatchSummary.supportedCount} supported requirement{recruiterRoleMatchSummary.supportedCount === 1 ? "" : "s"} · {recruiterRoleMatchSummary.partialCount} partial · {recruiterRoleMatchSummary.gapCount} gap{recruiterRoleMatchSummary.gapCount === 1 ? "" : "s"}</p>
                </aside>
              </section>

              <section className="passport-ledger-section">
                <div className="passport-section-heading">
                  <div><p className="passport-section-kicker">SKILL EVIDENCE LEDGER</p><h3>Claims with their supporting work</h3></div>
                  <p>{passportSkillProfiles.length} skill{passportSkillProfiles.length === 1 ? "" : "s"} connected to reviewed evidence</p>
                </div>
                <div className="passport-ledger" role="list" aria-label="Skill evidence ledger">
                  <div className="passport-ledger-head" aria-hidden="true"><span>Skill</span><span>Supporting evidence</span><span>Signal</span></div>
                  {passportSkillProfiles.map((skill) => (
                    <div className="passport-ledger-row" role="listitem" key={skill.skill}>
                      <div className="passport-skill-cell"><strong>{skill.skill}</strong><span>{skill.category} · {skill.proficiencyEstimate}</span></div>
                      <div className="passport-evidence-cell"><strong>{skill.evidenceItems.map((item) => item.supportingProject).join(" · ")}</strong><span>{skill.evidenceItems.length} evidence item{skill.evidenceItems.length === 1 ? "" : "s"} · latest {formatEvidenceDate(skill.lastUsed)}</span></div>
                      <div className="passport-signal-cell"><span>{skill.verificationStatus}</span><small>{skill.confidenceScore}% demo signal</small></div>
                    </div>
                  ))}
                  {!passportSkillProfiles.length && <div className="passport-empty-ledger">No recruiter-visible skill evidence has been reviewed yet. Add an artifact, review the suggested skills, then choose its visibility.</div>}
                </div>
                <p className="passport-method-note">“AI-supported” means the local demo analyzer found matching text signals in candidate-submitted material. It does not mean official, mentor, or assessment verification.</p>
              </section>

              <section className="passport-summary-grid">
                <div className="passport-alignment">
                  <div className="passport-section-heading"><div><p className="passport-section-kicker">ROLE ALIGNMENT</p><h3>Where this evidence fits</h3></div></div>
                  <div className="passport-fit-list">
                    {recruiterRoleMatchSummary.items.map((item) => (
                      <div className={`passport-fit-item ${item.matchStatus === "Supported match" ? "is-supported" : item.matchStatus === "Gap" ? "is-gap" : "is-partial"}`} key={item.requiredSkill}>
                        <span aria-hidden="true">{item.matchStatus === "Supported match" ? "✓" : item.matchStatus === "Gap" ? "–" : "~"}</span>
                        <div><strong>{item.requiredSkill}</strong><small>{item.matchStatus === "Supported match" ? "Supported by shared evidence" : item.matchStatus === "Gap" ? "No shared evidence yet" : "Signal needs stronger evidence"}</small></div>
                      </div>
                    ))}
                  </div>
                  <p className="passport-score-note">{recruiterRoleMatchSummary.formula}</p>
                </div>
                <div className="passport-sources">
                  <div className="passport-section-heading"><div><p className="passport-section-kicker">EVIDENCE INCLUDED</p><h3>Reviewed source material</h3></div></div>
                  <ul>
                    {recruiterProjects.map((project) => <li key={project.id}><span>{project.evidenceType ?? "Project evidence"}</span><strong>{project.projectName}</strong><small>{formatEvidenceDate(project.submittedAt)} · candidate reviewed</small></li>)}
                    {!recruiterProjects.length && <li className="passport-empty-source">No evidence is included in this share view.</li>}
                  </ul>
                </div>
              </section>

              {passportRoleNeeds.length > 0 && <section className="passport-next-proof">
                <div><p className="passport-section-kicker">NEXT PROOF TO ADD</p><h3>Evidence that would strengthen this role match</h3></div>
                <div>{passportRoleNeeds.slice(0, 2).map((item) => <p key={item.requiredSkill}><strong>{item.requiredSkill}</strong><span>{item.nextEvidence}</span></p>)}</div>
              </section>}

              <footer className="passport-footer">
                <p><strong>How to read this passport</strong> · It records candidate-submitted evidence, candidate review, and transparent demo analysis signals. It is not an independent credential.</p>
                <p>{recruiterProjects.length} reviewed evidence source{recruiterProjects.length === 1 ? "" : "s"} · candidate-controlled visibility</p>
              </footer>
            </article>

            <div className="passport-actions no-print">
              <p>The share view includes only candidate-reviewed, recruiter-visible material.</p>
              <div><button type="button" onClick={copyPassport} className="primary-button">Copy passport text <span>↗</span></button><button type="button" onClick={printPassport} className="passport-print-button">Print / Save as PDF</button></div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
