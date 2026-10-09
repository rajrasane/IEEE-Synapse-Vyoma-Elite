"use client";

import { FormEvent, useMemo, useState } from "react";
import { analyzeProjectEvidence, buildSkillProfiles, generateRoadmap, matchRoleRequirements } from "@/lib/analysis";
import { DEMO_CANDIDATE, DEMO_PROJECTS, SAMPLE_ROLES } from "@/lib/demo-data";
import { ProjectEvidenceInput, ProjectFormState } from "@/lib/types";

type TabKey = "dashboard" | "skills" | "evidence" | "role" | "roadmap" | "passport";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "skills", label: "Skills" },
  { key: "evidence", label: "Evidence" },
  { key: "role", label: "Role Match" },
  { key: "roadmap", label: "Learning Roadmap" },
  { key: "passport", label: "Recruiter View" },
];

const EMPTY_FORM: ProjectFormState = {
  projectName: "",
  description: "",
  technologies: "",
  projectUrl: "",
  evidenceNotes: "",
};

const statusClassName = (status: string): string => {
  switch (status) {
    case "Evidence found":
    case "Supported match":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Needs review":
    case "Partial or uncertain match":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "No evidence":
    case "Gap":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

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
  const [projects, setProjects] = useState<ProjectEvidenceInput[]>(DEMO_PROJECTS);
  const [selectedRoleId, setSelectedRoleId] = useState(SAMPLE_ROLES[0].id);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
  const [message, setMessage] = useState<string>("Demo profile is loaded.");

  const selectedRole = useMemo(
    () => SAMPLE_ROLES.find((role) => role.id === selectedRoleId) ?? SAMPLE_ROLES[0],
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

  const evidenceFoundCount = skillProfiles.filter((skill) => skill.evidenceStatus === "Evidence found").length;
  const needsReviewCount = skillProfiles.filter((skill) => skill.evidenceStatus === "Needs review").length;

  const resetToDemo = (): void => {
    setCandidateName(DEMO_CANDIDATE.name);
    setCandidateHeadline(DEMO_CANDIDATE.headline);
    setCandidateSummary(DEMO_CANDIDATE.summary);
    setProjects(DEMO_PROJECTS);
    setSelectedRoleId(SAMPLE_ROLES[0].id);
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
      sourceLabel: "User provided",
    };

    setProjects((current) => [nextProject, ...current]);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setActiveTab("skills");
    setMessage("Project evidence analyzed and added to your profile.");
  };

  const copyPassport = async (): Promise<void> => {
    const passportText = [
      `SkillPassport — Skills You Can Prove`,
      `Candidate: ${candidateName}`,
      `Headline: ${candidateHeadline}`,
      `Summary: ${candidateSummary}`,
      "",
      `Target Role: ${selectedRole.title}`,
      `Readiness: ${roleMatchSummary.readinessScore}%`,
      roleMatchSummary.formula,
      "",
      "Evidence-backed Skills:",
      ...skillProfiles
        .filter((skill) => skill.evidenceStatus === "Evidence found")
        .map((skill) => `- ${skill.skill}: ${skill.explanation}`),
      "",
      "Skills Needing Review:",
      ...skillProfiles
        .filter((skill) => skill.evidenceStatus !== "Evidence found")
        .map((skill) => `- ${skill.skill}: ${skill.evidenceStatus}. ${skill.reviewNotes}`),
      "",
      "Role Gaps and Next Evidence:",
      ...roleMatchSummary.items.map(
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white no-print">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">SkillPassport</p>
              <h1 className="text-3xl font-bold text-slate-900">Skills You Can Prove</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Evidence-backed skill intelligence for students and recruiters. No skill is marked verified without
                supporting evidence.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetToDemo}
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
              >
                Load Demo Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setProjects([]);
                  setMessage("Projects cleared. Add project evidence to continue.");
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Clear Projects
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 no-print md:grid-cols-3">
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
              {SAMPLE_ROLES.map((role) => (
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
        </section>

        {message && (
          <p className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-800 no-print">
            {message}
          </p>
        )}

        {activeTab === "dashboard" && (
          <section className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Evidence-backed skills", value: evidenceFoundCount.toString() },
                { title: "Skills requiring review", value: needsReviewCount.toString() },
                { title: "Role readiness", value: `${roleMatchSummary.readinessScore}%` },
                { title: "Projects analyzed", value: projects.length.toString() },
              ].map((item) => (
                <article key={item.title} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">{item.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{item.value}</p>
                </article>
              ))}
            </div>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Profile Summary</h2>
              <p className="mt-2 text-slate-700">{candidateSummary}</p>
              <p className="mt-3 text-sm text-slate-500">Target role: {selectedRole.title}</p>
              <p className="mt-2 text-sm text-slate-500">{roleMatchSummary.formula}</p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Recent Evidence Items</h2>
              <div className="mt-4 grid gap-3">
                {projectAnalyses.flatMap(({ evidence }) => evidence).slice(0, 5).map((item, index) => (
                  <div key={`${item.skill}-${index}`} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{item.skill}</p>
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClassName(item.evidenceStatus)}`}>
                        {item.evidenceStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>
                    <p className="mt-1 text-xs text-slate-500">Source: {item.evidenceSource}</p>
                  </div>
                ))}
                {projectAnalyses.flatMap(({ evidence }) => evidence).length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                    No evidence found yet. Add a project in the Evidence tab.
                  </p>
                )}
              </div>
            </article>
          </section>
        )}

        {activeTab === "skills" && (
          <section className="grid gap-4">
            {skillProfiles.map((skill) => (
              <article key={skill.skill} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-semibold">{skill.skill}</h2>
                    <p className="text-sm text-slate-500">Category: {skill.category}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClassName(skill.evidenceStatus)}`}>
                    {skill.evidenceStatus}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700">Proficiency estimate: {skill.proficiencyEstimate}</p>
                <p className="mt-2 text-sm text-slate-700">{skill.explanation}</p>
                <p className="mt-2 text-sm text-slate-600">Review note: {skill.reviewNotes}</p>

                {skill.evidenceItems.length > 0 ? (
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-600">
                          <th className="py-2 pr-3">Evidence source</th>
                          <th className="py-2 pr-3">Project</th>
                          <th className="py-2 pr-3">Reference</th>
                          <th className="py-2 pr-3">Why relevant</th>
                          <th className="py-2">Limitations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skill.evidenceItems.map((item, index) => (
                          <tr key={`${item.skill}-${index}`} className="border-b border-slate-100 align-top">
                            <td className="py-2 pr-3">{item.evidenceSource}</td>
                            <td className="py-2 pr-3">{item.supportingProject}</td>
                            <td className="py-2 pr-3 text-xs text-slate-600">{item.reference}</td>
                            <td className="py-2 pr-3">{item.explanation}</td>
                            <td className="py-2">{item.reviewNotes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                    No linked evidence yet.
                  </p>
                )}
              </article>
            ))}
          </section>
        )}

        {activeTab === "evidence" && (
          <section className="grid gap-5 lg:grid-cols-5">
            <article className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 no-print">
              <h2 className="text-lg font-semibold">Add Project Evidence</h2>
              <p className="mt-1 text-sm text-slate-600">
                Analysis is local and deterministic. Skill signals come from keywords in your supplied text.
              </p>
              <form onSubmit={submitProject} className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">
                  Project name *
                  <input
                    value={form.projectName}
                    onChange={(event) => setForm((current) => ({ ...current, projectName: event.target.value }))}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                  {formErrors.projectName && <span className="text-xs text-rose-700">{formErrors.projectName}</span>}
                </label>

                <label className="grid gap-1 text-sm">
                  Project description *
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                  {formErrors.description && <span className="text-xs text-rose-700">{formErrors.description}</span>}
                </label>

                <label className="grid gap-1 text-sm">
                  Technologies used * (comma separated)
                  <input
                    value={form.technologies}
                    onChange={(event) => setForm((current) => ({ ...current, technologies: event.target.value }))}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                  {formErrors.technologies && <span className="text-xs text-rose-700">{formErrors.technologies}</span>}
                </label>

                <label className="grid gap-1 text-sm">
                  Project URL (optional)
                  <input
                    value={form.projectUrl}
                    onChange={(event) => setForm((current) => ({ ...current, projectUrl: event.target.value }))}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                  {formErrors.projectUrl && <span className="text-xs text-rose-700">{formErrors.projectUrl}</span>}
                </label>

                <label className="grid gap-1 text-sm">
                  Evidence notes or excerpts (optional)
                  <textarea
                    rows={3}
                    value={form.evidenceNotes}
                    onChange={(event) => setForm((current) => ({ ...current, evidenceNotes: event.target.value }))}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                </label>

                <button
                  type="submit"
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Analyze Evidence
                </button>
              </form>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-3">
              <h2 className="text-lg font-semibold">Project Evidence Results</h2>
              <div className="mt-4 grid gap-4">
                {projectAnalyses.map(({ project, evidence }) => (
                  <div key={project.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{project.projectName}</p>
                      <p className="text-xs text-slate-500">{project.sourceLabel}</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Technologies: {project.technologies.join(", ")} {project.projectUrl ? `| Link: ${project.projectUrl}` : ""}
                    </p>

                    {evidence.length > 0 ? (
                      <ul className="mt-3 grid gap-2">
                        {evidence.map((item, index) => (
                          <li key={`${project.id}-${item.skill}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{item.skill}</p>
                              <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClassName(item.evidenceStatus)}`}>
                                {item.evidenceStatus}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-700">{item.explanation}</p>
                            <p className="mt-1 text-xs text-slate-600">Triggers: {item.triggers.join(", ")}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        No configured skill keywords were found in this project input.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </article>
          </section>
        )}

        {activeTab === "role" && (
          <section className="grid gap-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">{selectedRole.title}</h2>
              <p className="mt-1 text-sm text-slate-600">{selectedRole.summary}</p>
              <p className="mt-2 text-sm text-slate-500">{roleMatchSummary.formula}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
                  Supported: {roleMatchSummary.supportedCount}
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                  Partial: {roleMatchSummary.partialCount}
                </span>
                <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-800">Gaps: {roleMatchSummary.gapCount}</span>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-5 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="py-2 pr-3">Required skill</th>
                    <th className="py-2 pr-3">Candidate evidence status</th>
                    <th className="py-2 pr-3">Match status</th>
                    <th className="py-2 pr-3">Explanation</th>
                    <th className="py-2">Needed next evidence/practice</th>
                  </tr>
                </thead>
                <tbody>
                  {roleMatchSummary.items.map((item) => (
                    <tr key={item.requiredSkill} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-3 font-medium">{item.requiredSkill}</td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClassName(item.candidateEvidenceStatus)}`}>
                          {item.candidateEvidenceStatus}
                        </span>
                      </td>
                      <td className="py-2 pr-3">
                        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${statusClassName(item.matchStatus)}`}>
                          {item.matchStatus}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{item.explanation}</td>
                      <td className="py-2">{item.nextEvidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </section>
        )}

        {activeTab === "roadmap" && (
          <section className="grid gap-4">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-semibold">Prioritized Learning Roadmap</h2>
              <p className="mt-1 text-sm text-slate-600">
                Recommendations are generated from role gaps and partial matches for {selectedRole.title}.
              </p>
            </article>

            {roadmap.length > 0 ? (
              roadmap.map((task) => (
                <article key={`${task.skill}-${task.priorityOrder}`} className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-base font-semibold">
                      #{task.priorityOrder} — {task.skill}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-1 text-xs font-semibold ${
                        task.priorityLabel === "High"
                          ? "border-rose-200 bg-rose-100 text-rose-800"
                          : "border-amber-200 bg-amber-100 text-amber-800"
                      }`}
                    >
                      {task.priorityLabel} priority
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">Why it matters: {task.whyItMatters}</p>
                  <p className="mt-2 text-sm text-slate-700">Practice task: {task.practiceTask}</p>
                  <p className="mt-2 text-sm text-slate-700">Expected evidence to produce: {task.expectedEvidence}</p>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No roadmap tasks needed right now. All current role requirements are supported.
              </p>
            )}
          </section>
        )}

        {activeTab === "passport" && (
          <section id="passport-view" className="grid gap-4">
            <article className="rounded-xl border border-slate-200 bg-white p-6 print-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">SkillPassport</p>
                  <h2 className="text-2xl font-bold text-slate-900">{candidateName}</h2>
                  <p className="text-sm text-slate-600">{candidateHeadline}</p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p className="font-medium text-slate-800">Target Role: {selectedRole.title}</p>
                  <p>Readiness: {roleMatchSummary.readinessScore}%</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-700">{candidateSummary}</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Projects</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {projects.map((project) => (
                      <li key={project.id} className="rounded-lg border border-slate-200 p-2">
                        <p className="font-medium">{project.projectName}</p>
                        <p className="text-xs text-slate-500">{project.sourceLabel}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Evidence-backed skills</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {skillProfiles
                      .filter((skill) => skill.evidenceStatus === "Evidence found")
                      .map((skill) => (
                        <li key={skill.skill} className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                          <p className="font-medium">{skill.skill}</p>
                          <p className="text-xs">{skill.explanation}</p>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Skills needing review</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {skillProfiles
                      .filter((skill) => skill.evidenceStatus !== "Evidence found")
                      .map((skill) => (
                        <li key={skill.skill} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                          <p className="font-medium">
                            {skill.skill} — {skill.evidenceStatus}
                          </p>
                          <p className="text-xs">{skill.reviewNotes}</p>
                        </li>
                      ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-800">Role gap summary</h3>
                  <ul className="mt-2 grid gap-2 text-sm text-slate-700">
                    {roleMatchSummary.items.map((item) => (
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
