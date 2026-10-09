import { SKILL_RULES } from "./demo-data";
import {
  EvidenceStatus,
  MatchStatus,
  ProjectEvidenceInput,
  RoadmapTask,
  RoleMatchItem,
  RoleMatchSummary,
  RoleRequirement,
  SkillEvidence,
  SkillProfile,
  SkillRule,
} from "./types";

const splitTokens = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(Boolean);

const statusFromSignals = (signals: number): EvidenceStatus => {
  if (signals >= 2) return "Evidence found";
  if (signals === 1) return "Needs review";
  return "No evidence";
};

const proficiencyLabel = (signals: number): string => {
  if (signals >= 3) return "Applied with repeated evidence";
  if (signals >= 2) return "Applied in project context";
  if (signals === 1) return "Possible exposure (needs review)";
  return "Not supported by supplied evidence";
};

const detectSkillForRule = (
  project: ProjectEvidenceInput,
  rule: SkillRule,
): SkillEvidence | null => {
  const combined = `${project.description} ${project.technologies.join(" ")} ${project.evidenceNotes ?? ""}`;
  const tokens = splitTokens(combined);

  const triggerMatches = rule.keywords.filter((keyword) =>
    tokens.some((token) => token.includes(keyword.toLowerCase())),
  );

  if (triggerMatches.length === 0) {
    return null;
  }

  const evidenceStatus = statusFromSignals(triggerMatches.length);

  return {
    skill: rule.skill,
    category: rule.category,
    evidenceStatus,
    proficiencyEstimate: proficiencyLabel(triggerMatches.length),
    evidenceSource: `${project.sourceLabel} project input`,
    supportingProject: project.projectName,
    reference:
      project.projectUrl && project.projectUrl.trim().length > 0
        ? `${project.projectUrl} (user/demo supplied link; not auto-verified)`
        : "Project description and evidence notes provided in-app",
    explanation: `Detected keywords for ${rule.skill}: ${triggerMatches.join(", ")} from provided project text.`,
    reviewNotes:
      evidenceStatus === "Evidence found"
        ? "Evidence indicates usage in supplied materials, but does not prove expert mastery."
        : "Signal is limited or ambiguous; reviewer should inspect code artifacts or concrete output.",
    triggers: triggerMatches,
  };
};

export const analyzeProjectEvidence = (project: ProjectEvidenceInput): SkillEvidence[] => {
  return SKILL_RULES.map((rule) => detectSkillForRule(project, rule)).filter(
    (item): item is SkillEvidence => item !== null,
  );
};

const compareStatus = (status: EvidenceStatus): MatchStatus => {
  if (status === "Evidence found") return "Supported match";
  if (status === "Needs review") return "Partial or uncertain match";
  return "Gap";
};

const emptySkillProfile = (requirement: RoleRequirement): SkillProfile => ({
  skill: requirement.skill,
  category: "Programming",
  evidenceStatus: "No evidence",
  proficiencyEstimate: "Not supported by supplied evidence",
  explanation: "No matching skill signals were detected in supplied project evidence.",
  reviewNotes: "Provide project artifacts or excerpts that clearly show this skill in use.",
  evidenceItems: [],
});

export const buildSkillProfiles = (
  projects: ProjectEvidenceInput[],
  requirements: RoleRequirement[],
): SkillProfile[] => {
  const bySkill = new Map<string, SkillEvidence[]>();

  projects.forEach((project) => {
    analyzeProjectEvidence(project).forEach((evidence) => {
      const existing = bySkill.get(evidence.skill) ?? [];
      bySkill.set(evidence.skill, [...existing, evidence]);
    });
  });

  requirements.forEach((requirement) => {
    if (!bySkill.has(requirement.skill)) {
      bySkill.set(requirement.skill, []);
    }
  });

  return Array.from(bySkill.entries()).map(([skill, evidenceItems]) => {
    if (evidenceItems.length === 0) {
      const matchingRequirement = requirements.find((requirement) => requirement.skill === skill);
      return matchingRequirement
        ? emptySkillProfile(matchingRequirement)
        : {
            skill,
            category: "Programming",
            evidenceStatus: "No evidence",
            proficiencyEstimate: "Not supported by supplied evidence",
            explanation: "No evidence is currently linked to this skill.",
            reviewNotes: "Add concrete project outputs to support this claim.",
            evidenceItems: [],
          };
    }

    const status: EvidenceStatus = evidenceItems.some((item) => item.evidenceStatus === "Evidence found")
      ? "Evidence found"
      : "Needs review";

    return {
      skill,
      category: evidenceItems[0].category,
      evidenceStatus: status,
      proficiencyEstimate:
        status === "Evidence found" ? "Applied in at least one supplied project" : "Possible exposure (needs review)",
      explanation:
        status === "Evidence found"
          ? "One or more supplied project inputs contain direct matching signals for this skill."
          : "Only limited or ambiguous keyword signals were detected for this skill.",
      reviewNotes:
        status === "Evidence found"
          ? "Evidence supports usage, but mastery still requires deeper artifact review."
          : "Collect clearer code snippets, commits, or deliverables before claiming confidence.",
      evidenceItems,
    };
  });
};

export const matchRoleRequirements = (
  requirements: RoleRequirement[],
  profiles: SkillProfile[],
): RoleMatchSummary => {
  const profileMap = new Map(profiles.map((profile) => [profile.skill, profile]));

  const items: RoleMatchItem[] = requirements.map((requirement) => {
    const profile = profileMap.get(requirement.skill);
    const candidateEvidenceStatus = profile?.evidenceStatus ?? "No evidence";
    const matchStatus = compareStatus(candidateEvidenceStatus);

    return {
      requiredSkill: requirement.skill,
      candidateEvidenceStatus,
      matchStatus,
      explanation:
        matchStatus === "Supported match"
          ? `Requirement is supported by supplied evidence for ${requirement.skill}.`
          : matchStatus === "Partial or uncertain match"
            ? `Some signal exists for ${requirement.skill}, but evidence depth is not yet convincing.`
            : `No supporting evidence for ${requirement.skill} was detected in supplied inputs.`,
      nextEvidence: requirement.expectedEvidence,
    };
  });

  const supportedCount = items.filter((item) => item.matchStatus === "Supported match").length;
  const partialCount = items.filter((item) => item.matchStatus === "Partial or uncertain match").length;
  const gapCount = items.filter((item) => item.matchStatus === "Gap").length;

  const weightedScore = (supportedCount + partialCount * 0.5) / Math.max(items.length, 1);
  const readinessScore = Math.round(weightedScore * 100);

  return {
    items,
    supportedCount,
    partialCount,
    gapCount,
    readinessScore,
    formula:
      "Readiness = ((supported matches × 1) + (partial matches × 0.5)) / total requirements × 100",
  };
};

export const generateRoadmap = (
  requirements: RoleRequirement[],
  matchSummary: RoleMatchSummary,
): RoadmapTask[] => {
  const requirementBySkill = new Map(requirements.map((item) => [item.skill, item]));

  const tasks = matchSummary.items
    .filter((item) => item.matchStatus !== "Supported match")
    .map((item) => {
      const requirement = requirementBySkill.get(item.requiredSkill);
      if (!requirement) return null;

      return {
        priorityLabel:
          item.matchStatus === "Gap" || requirement.priority === "High" ? "High" : "Medium",
        skill: item.requiredSkill,
        whyItMatters: requirement.whyItMatters,
        practiceTask: requirement.practiceTask,
        expectedEvidence: requirement.expectedEvidence,
      };
    })
    .filter((item): item is Omit<RoadmapTask, "priorityOrder"> => item !== null)
    .sort((a, b) => {
      if (a.priorityLabel === b.priorityLabel) return a.skill.localeCompare(b.skill);
      return a.priorityLabel === "High" ? -1 : 1;
    })
    .map((item, index) => ({ ...item, priorityOrder: index + 1 }));

  return tasks;
};
