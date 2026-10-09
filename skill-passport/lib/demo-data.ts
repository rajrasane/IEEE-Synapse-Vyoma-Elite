import { CandidateProfile, ProjectEvidenceInput, SkillRule, TargetRole } from "./types";

export const DEMO_CANDIDATE: CandidateProfile = {
  name: "Aarav Kulkarni",
  headline: "Frontend-focused Computer Science Student",
  summary:
    "Builds student products with React and TypeScript, ships responsive interfaces, and documents implementation decisions in project notes.",
  education: "B.Tech · Computer Science",
  experienceLevel: "Student · Early career",
  githubUrl: "https://github.com/aaravkulkarni",
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
  { skill: "Java", category: "Programming", keywords: ["java", "jvm"], expectedEvidence: "Java source code and a working application", practiceTask: "Build and document a small Java service." },
  { skill: "Spring Boot", category: "Backend", keywords: ["spring boot", "springboot"], expectedEvidence: "Spring Boot application with routes and configuration", practiceTask: "Create a small Spring Boot REST service." },
  { skill: "REST API", category: "Backend", keywords: ["rest api", "restful", "endpoint", "api"], expectedEvidence: "Designed endpoints, request handling, and documented responses", practiceTask: "Build and document a REST API with validation." },
  { skill: "SQL", category: "Data", keywords: ["sql", "postgresql", "mysql", "database"], expectedEvidence: "Queries, schema, and persistent data operations", practiceTask: "Design a relational schema and write representative queries." },
  { skill: "Docker", category: "Backend", keywords: ["docker", "container", "dockerfile"], expectedEvidence: "Container configuration and reproducible environment", practiceTask: "Containerise a service and document how to run it." },
  { skill: "Cloud deployment", category: "Backend", keywords: ["cloud", "deploy", "vercel", "aws", "azure"], expectedEvidence: "Deployed service with environment and release notes", practiceTask: "Deploy a project and document its runtime configuration." },
  { skill: "Linux", category: "Programming", keywords: ["linux", "bash", "shell"], expectedEvidence: "Scripts or operational work in a Linux environment", practiceTask: "Write a setup script and document the environment." },
  { skill: "CI/CD", category: "Testing", keywords: ["ci/cd", "github actions", "pipeline"], expectedEvidence: "Automated build, test, or deployment workflow", practiceTask: "Add a CI workflow that runs checks on each pull request." },
  { skill: "Python", category: "Programming", keywords: ["python", "pandas", "numpy"], expectedEvidence: "Python code or analysis notebooks", practiceTask: "Complete a small Python project and explain the approach." },
  { skill: "Data visualization", category: "Data", keywords: ["visualization", "dashboard", "matplotlib", "plotly"], expectedEvidence: "Charts that communicate a data finding", practiceTask: "Build a chart and write a short interpretation of its result." },
  { skill: "Statistics", category: "Data", keywords: ["statistics", "regression", "hypothesis", "probability"], expectedEvidence: "Statistical method applied and explained", practiceTask: "Apply one statistical method to a dataset and explain assumptions." },
  { skill: "Machine Learning", category: "Data", keywords: ["machine learning", "model", "scikit-learn", "pytorch"], expectedEvidence: "Model training, evaluation, and limitations", practiceTask: "Train and evaluate a baseline model with a clear metric." },
  { skill: "Automation", category: "Testing", keywords: ["automation", "automated test", "playwright", "selenium"], expectedEvidence: "Automated checks for key user or API flows", practiceTask: "Automate a critical user journey and document the cases." },
  { skill: "API Testing", category: "Testing", keywords: ["api testing", "postman", "integration test"], expectedEvidence: "API requests and assertions for success and failure paths", practiceTask: "Write API checks for validation and failure behavior." },
  { skill: "Communication", category: "Collaboration", keywords: ["presentation", "stakeholder", "communication", "report"], expectedEvidence: "Clear technical explanation or stakeholder deliverable", practiceTask: "Present a project decision and trade-offs in a short report." },
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
    evidenceType: "Deployed project",
    submittedAt: "2026-08-18",
    visibility: "Recruiters",
    reviewStatus: "reviewed",
    acceptedSkills: ["React", "TypeScript", "Responsive UI"],
    verificationStatus: "AI-supported",
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
    evidenceType: "GitHub repository",
    submittedAt: "2026-07-26",
    visibility: "Recruiters",
    reviewStatus: "reviewed",
    acceptedSkills: ["React", "API Integration", "Git Collaboration"],
    verificationStatus: "AI-supported",
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
    evidenceType: "Project report",
    submittedAt: "2026-06-11",
    visibility: "Recruiters",
    reviewStatus: "reviewed",
    acceptedSkills: ["Responsive UI", "Testing"],
    verificationStatus: "AI-supported",
    sourceLabel: "Demo sample",
  },
];

const role = (id: string, title: string, summary: string, skills: Array<[string, "High" | "Medium"]>): TargetRole => ({
  id, title, summary,
  requirements: skills.map(([skill, priority]) => ({
    skill, priority,
    whyItMatters: `${skill} is part of the day-to-day work for a ${title}.`,
    expectedEvidence: `A project artifact showing ${skill} in a real implementation.`,
    practiceTask: `Complete a small ${skill} task, then attach the result and a short technical explanation.`,
  })),
});

export const ADDITIONAL_ROLES: TargetRole[] = [
  role("backend", "Backend Developer", "Build dependable APIs, data models, and services.", [["Java", "High"], ["REST API", "High"], ["SQL", "High"], ["Testing", "Medium"], ["Git Collaboration", "Medium"], ["Cloud deployment", "Medium"]]),
  role("devops", "DevOps Engineer", "Automate delivery and operate reliable services.", [["Docker", "High"], ["CI/CD", "High"], ["Linux", "High"], ["Cloud deployment", "High"], ["Git Collaboration", "Medium"], ["Testing", "Medium"]]),
  role("fullstack", "Full-Stack Developer", "Ship complete product features across the stack.", [["React", "High"], ["TypeScript", "High"], ["REST API", "High"], ["SQL", "Medium"], ["Testing", "Medium"], ["Git Collaboration", "Medium"]]),
  role("data-analyst", "Data Analyst", "Turn data into clear, actionable findings.", [["Python", "High"], ["SQL", "High"], ["Data visualization", "High"], ["Statistics", "High"], ["Communication", "Medium"], ["Git Collaboration", "Medium"]]),
  role("qa", "QA Automation Engineer", "Protect product quality with thoughtful automated checks.", [["Testing", "High"], ["Automation", "High"], ["API Testing", "High"], ["Python", "Medium"], ["CI/CD", "Medium"], ["Git Collaboration", "Medium"]]),
  role("ml", "Machine Learning Engineer", "Build, evaluate, and deploy machine learning systems.", [["Python", "High"], ["Machine Learning", "High"], ["Statistics", "High"], ["SQL", "Medium"], ["Docker", "Medium"], ["Cloud deployment", "Medium"]]),
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

export const ALL_ROLES: TargetRole[] = [...SAMPLE_ROLES, ...ADDITIONAL_ROLES];
