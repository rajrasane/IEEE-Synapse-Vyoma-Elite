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

  const normalizedText = combined.toLowerCase();
  const triggerMatches = rule.keywords.filter((keyword) => {
    const normalizedKeyword = keyword.toLowerCase();
    if (/[\s/]/.test(normalizedKeyword)) return normalizedText.includes(normalizedKeyword);
    if (normalizedKeyword === "java") return tokens.includes("java");
    return tokens.some((token) => token === normalizedKeyword || token.startsWith(normalizedKeyword));
  });

  if (triggerMatches.length === 0) {
    return null;
  }

  const evidenceStatus = statusFromSignals(triggerMatches.length);

  return {
    skill: rule.skill,
    category: rule.category,
    evidenceStatus,
    proficiencyEstimate: proficiencyLabel(triggerMatches.length),
    evidenceSource: `${project.evidenceType ?? "Project evidence"} · ${project.sourceLabel}`,
    supportingProject: project.projectName,
    supportingProjectId: project.id,
    reference:
      project.projectUrl && project.projectUrl.trim().length > 0
        ? `${project.projectUrl} (submitted link; not fetched or verified)`
        : "Project description and evidence notes provided in-app",
    explanation: `The demo analyzer found ${triggerMatches.join(", ")} in the submitted project details. This is a suggested signal, not independent verification.`,
    reviewNotes:
      evidenceStatus === "Evidence found"
        ? "Evidence indicates usage in supplied materials, but does not prove expert mastery."
        : "Signal is limited or ambiguous; reviewer should inspect code artifacts or concrete output.",
    triggers: triggerMatches,
    confidenceScore: Math.min(90, 52 + triggerMatches.length * 11),
    verificationStatus: project.verificationStatus ?? "Self-declared",
    submittedAt: project.submittedAt,
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
  confidenceScore: 0,
  lastUsed: "No evidence yet",
  verificationStatus: "Self-declared",
});

export const buildSkillProfiles = (
  projects: ProjectEvidenceInput[],
  requirements: RoleRequirement[],
): SkillProfile[] => {
  const bySkill = new Map<string, SkillEvidence[]>();

  projects.forEach((project) => {
    if (project.reviewStatus !== "reviewed") return;
    analyzeProjectEvidence(project)
      .filter((evidence) => (project.acceptedSkills ?? []).includes(evidence.skill))
      .forEach((evidence) => {
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
            confidenceScore: 0,
            lastUsed: "No evidence yet",
            verificationStatus: "Self-declared",
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
      confidenceScore: Math.max(...evidenceItems.map((item) => item.confidenceScore)),
      lastUsed: evidenceItems.map((item) => item.submittedAt ?? "").filter(Boolean).sort().at(-1) ?? "Date not supplied",
      verificationStatus: evidenceItems.some((item) => item.verificationStatus === "Evidence-backed")
        ? "Evidence-backed"
        : evidenceItems[0].verificationStatus,
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

  const totalWeight = requirements.reduce((total, item) => total + (item.priority === "High" ? 2 : 1), 0);
  const achievedWeight = items.reduce((total, item, index) => {
    const weight = requirements[index]?.priority === "High" ? 2 : 1;
    return total + (item.matchStatus === "Supported match" ? weight : item.matchStatus === "Partial or uncertain match" ? weight * 0.5 : 0);
  }, 0);
  const weightedScore = achievedWeight / Math.max(totalWeight, 1);
  const readinessScore = Math.round(weightedScore * 100);

  return {
    items,
    supportedCount,
    partialCount,
    gapCount,
    readinessScore,
    formula:
      "Role match = weighted supported requirements + half-weight partial requirements, divided by total role weight. High priority skills count double.",
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
