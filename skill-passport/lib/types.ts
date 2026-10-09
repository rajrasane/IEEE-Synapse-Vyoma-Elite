export type EvidenceStatus = "Evidence found" | "Needs review" | "No evidence";

export type MatchStatus = "Supported match" | "Partial or uncertain match" | "Gap";

export type SkillCategory =
  | "Frontend"
  | "Programming"
  | "Collaboration"
  | "Testing"
  | "Data"
  | "Backend";

export type EvidenceType =
  | "GitHub repository"
  | "Deployed project"
  | "Project report"
  | "Internship"
  | "Certificate"
  | "Technical assessment"
  | "Hackathon"
  | "Mentor verification"
  | "Demo video"
  | "Technical article";

export type VerificationStatus =
  | "Self-declared"
  | "AI-supported"
  | "Evidence-backed"
  | "Mentor-verified"
  | "Assessment-verified";

export interface CandidateProfile {
  name: string;
  headline: string;
  summary: string;
  education?: string;
  experienceLevel?: string;
  githubUrl?: string;
}

export interface ProjectEvidenceInput {
  id: string;
  projectName: string;
  description: string;
  technologies: string[];
  projectUrl?: string;
  evidenceNotes?: string;
  evidenceType?: EvidenceType;
  submittedAt?: string;
  visibility?: "Recruiters" | "Private";
  reviewStatus?: "pending" | "reviewed";
  suggestedSkills?: string[];
  acceptedSkills?: string[];
  verificationStatus?: VerificationStatus;
  sourceLabel: "Demo sample" | "User provided";
}

export interface SkillRule {
  skill: string;
  category: SkillCategory;
  keywords: string[];
  expectedEvidence: string;
  practiceTask: string;
}

export interface SkillEvidence {
  skill: string;
  category: SkillCategory;
  evidenceStatus: EvidenceStatus;
  proficiencyEstimate: string;
  evidenceSource: string;
  supportingProject: string;
  supportingProjectId: string;
  reference: string;
  explanation: string;
  reviewNotes: string;
  triggers: string[];
  confidenceScore: number;
  verificationStatus: VerificationStatus;
  submittedAt?: string;
}

export interface SkillProfile {
  skill: string;
  category: SkillCategory;
  evidenceStatus: EvidenceStatus;
  proficiencyEstimate: string;
  explanation: string;
  reviewNotes: string;
  evidenceItems: SkillEvidence[];
  confidenceScore: number;
  lastUsed: string;
  verificationStatus: VerificationStatus;
}

export interface RoleRequirement {
  skill: string;
  priority: "High" | "Medium";
  whyItMatters: string;
  expectedEvidence: string;
  practiceTask: string;
}

export interface TargetRole {
  id: string;
  title: string;
  summary: string;
  requirements: RoleRequirement[];
}

export interface RoleMatchItem {
  requiredSkill: string;
  candidateEvidenceStatus: EvidenceStatus;
  matchStatus: MatchStatus;
  explanation: string;
  nextEvidence: string;
}

export interface RoleMatchSummary {
  items: RoleMatchItem[];
  supportedCount: number;
  partialCount: number;
  gapCount: number;
  readinessScore: number;
  formula: string;
}

export interface RoadmapTask {
  priorityOrder: number;
  priorityLabel: "High" | "Medium";
  skill: string;
  whyItMatters: string;
  practiceTask: string;
  expectedEvidence: string;
}

export interface ProjectFormState {
  projectName: string;
  description: string;
  technologies: string;
  projectUrl: string;
  evidenceNotes: string;
  evidenceType: EvidenceType;
  submittedAt: string;
  visibility: "Recruiters" | "Private";
}
