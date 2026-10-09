import { CandidateProfile, ProjectEvidenceInput, SkillRule, TargetRole } from "./types";

export const DEMO_CANDIDATE: CandidateProfile = {
  name: "Aarav Kulkarni",
  headline: "Frontend-focused Computer Science Student",
  summary:
    "Builds student products with React and TypeScript, ships responsive interfaces, and documents implementation decisions in project notes.",
};

export const SKILL_RULES: SkillRule[] = [
  {
    skill: "React",
    category: "Frontend",
    keywords: ["react", "jsx", "hooks", "component"],
    expectedEvidence: "UI components with state handling and reusable structure",
    practiceTask: "Build a feature with multiple reusable components and local state",
  },
  {
    skill: "TypeScript",
    category: "Programming",
    keywords: ["typescript", "type", "interface", "strict"],
    expectedEvidence: "Typed interfaces, props, and strict type-safe logic",
    practiceTask: "Refactor one project module to strict TypeScript types",
  },
  {
    skill: "Responsive UI",
    category: "Frontend",
    keywords: ["responsive", "mobile", "tailwind", "breakpoint"],
    expectedEvidence: "Layouts that adapt across mobile and desktop views",
    practiceTask: "Add responsive layout states and verify at two breakpoints",
  },
  {
    skill: "API Integration",
    category: "Backend",
    keywords: ["api", "fetch", "axios", "endpoint", "json"],
    expectedEvidence: "Client or server logic that consumes and renders API data",
    practiceTask: "Integrate an API with loading, error, and success states",
  },
  {
    skill: "Testing",
    category: "Testing",
    keywords: ["test", "jest", "vitest", "assert", "coverage"],
    expectedEvidence: "Automated tests with meaningful assertions",
    practiceTask: "Add at least three tests that cover success and failure behavior",
  },
  {
    skill: "Git Collaboration",
    category: "Collaboration",
    keywords: ["pull request", "review", "branch", "merge", "commit"],
    expectedEvidence: "Collaborative workflow with review and branch management",
    practiceTask: "Open a PR with clear description and handle review feedback",
  },
];

export const DEMO_PROJECTS: ProjectEvidenceInput[] = [
  {
    id: "demo-1",
    projectName: "Campus Events Finder",
    description:
      "Sample demo project: Built a React + TypeScript dashboard for browsing and filtering campus events with reusable components and stateful filters.",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    projectUrl: "https://demo.example.com/campus-events",
    evidenceNotes:
      "Sample demo evidence: implemented responsive card grid, custom hooks for filtering, and typed event interfaces.",
    sourceLabel: "Demo sample",
  },
  {
    id: "demo-2",
    projectName: "Study Sprint Tracker",
    description:
      "Sample demo project: Created a mobile-first study planner that fetches sprint templates from an API and tracks completion progress.",
    technologies: ["Next.js", "Tailwind CSS", "REST API"],
    projectUrl: "https://demo.example.com/study-sprint",
    evidenceNotes:
      "Sample demo evidence: used fetch to call endpoint, added loading and error states, and documented branch-based workflow in project notes.",
    sourceLabel: "Demo sample",
  },
  {
    id: "demo-3",
    projectName: "Portfolio Accessibility Refresh",
    description:
      "Sample demo project: Updated portfolio UI with keyboard-friendly navigation and semantic HTML but limited automated testing.",
    technologies: ["HTML", "CSS", "JavaScript"],
    evidenceNotes:
      "Sample demo evidence: added semantic landmarks and improved contrast. Testing evidence is incomplete and needs review.",
    sourceLabel: "Demo sample",
  },
];

export const SAMPLE_ROLES: TargetRole[] = [
  {
    id: "frontend-intern",
    title: "Frontend Developer Intern",
    summary: "Build responsive product features using React, TypeScript, and team workflows.",
    requirements: [
      {
        skill: "React",
        priority: "High",
        whyItMatters: "Core framework used to build and ship UI features.",
        expectedEvidence: "Reusable components and state-based feature implementation.",
        practiceTask: "Ship one feature with at least three reusable React components.",
      },
      {
        skill: "TypeScript",
        priority: "High",
        whyItMatters: "Helps teams maintain safer code and fewer runtime bugs.",
        expectedEvidence: "Typed interfaces, props, and strict compile-time checks.",
        practiceTask: "Define interfaces for feature state and API responses in a project.",
      },
      {
        skill: "Responsive UI",
        priority: "High",
        whyItMatters: "Interns are expected to support mobile and desktop users.",
        expectedEvidence: "Layouts tested across breakpoints with clear adaptation.",
        practiceTask: "Implement one responsive page and capture mobile + desktop screenshots.",
      },
      {
        skill: "API Integration",
        priority: "Medium",
        whyItMatters: "Most UI features rely on backend data.",
        expectedEvidence: "Fetch data from endpoints with loading and error handling.",
        practiceTask: "Connect UI to one API endpoint and log decisions in notes.",
      },
      {
        skill: "Testing",
        priority: "Medium",
        whyItMatters: "Teams rely on basic tests before merging product changes.",
        expectedEvidence: "Automated tests that verify feature behavior.",
        practiceTask: "Add tests for one component and one edge case failure state.",
      },
      {
        skill: "Git Collaboration",
        priority: "Medium",
        whyItMatters: "Daily work involves PR reviews and branch collaboration.",
        expectedEvidence: "PRs, review notes, and merge workflow references.",
        practiceTask: "Create one PR with clear checklist and respond to reviewer comments.",
      },
    ],
  },
  {
    id: "frontend-ui-intern",
    title: "UI Engineering Intern",
    summary: "Focus on design implementation quality, accessibility, and interaction polish.",
    requirements: [
      {
        skill: "React",
        priority: "High",
        whyItMatters: "Component architecture is essential for reusable UI systems.",
        expectedEvidence: "Component abstraction and state handling.",
        practiceTask: "Convert one static page into reusable React components.",
      },
      {
        skill: "Responsive UI",
        priority: "High",
        whyItMatters: "UI engineers must deliver usable designs at every viewport size.",
        expectedEvidence: "Documented breakpoint behaviors and adaptive layout patterns.",
        practiceTask: "Implement and document responsive states for one complex screen.",
      },
      {
        skill: "Testing",
        priority: "Medium",
        whyItMatters: "UI regressions should be caught before release.",
        expectedEvidence: "Tests covering component rendering and interaction states.",
        practiceTask: "Write rendering and interaction tests for one component group.",
      },
      {
        skill: "TypeScript",
        priority: "Medium",
        whyItMatters: "Improves maintainability and handoff quality in UI codebases.",
        expectedEvidence: "Typed component props and state models.",
        practiceTask: "Type all props/state for one existing feature module.",
      },
    ],
  },
];
