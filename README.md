# SkillPassport — Skills You Can Prove

SkillPassport is an evidence-backed skill intelligence MVP built for a hackathon demo.
It helps students/job seekers show **which skills are supported by project evidence** and helps recruiters quickly assess fit for a target role.

## Problem
Resumes list skills, but supporting proof is scattered across projects, notes, and repositories.
Recruiters need fast, transparent skill signals, and learners need clear gap guidance.

## Solution
SkillPassport:
- Analyzes project descriptions and evidence notes using deterministic local rules
- Generates a skill profile with transparent evidence statuses
- Compares profile skills against a target role (default: **Frontend Developer Intern**)
- Highlights supported matches, uncertain matches, and gaps
- Builds a prioritized learning roadmap tied to those gaps
- Produces a recruiter-friendly one-page passport with copy and print actions

## Tech Stack
- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Local typed sample data (offline demo ready)

## App Location
The Next.js application is in:

`/home/runner/work/IEEE-Synapse-Vyoma-Elite/IEEE-Synapse-Vyoma-Elite/skill-passport`

## Prerequisites
- Node.js 20+
- npm 10+

## Installation
From repository root:

```bash
cd skill-passport
npm install
```

## Run the App
From `skill-passport/`:

```bash
npm run dev
```

Open `http://localhost:3000`.

## MVP Features
- Polished dashboard with brand, summary cards, profile details, and role readiness
- Demo mode (`Load Demo Profile`) and reset support
- Project evidence input form with validation
- Deterministic skill signal analysis with trigger keywords
- Evidence-based skill table with:
  - Skill name and category
  - Evidence status
  - Proficiency estimate (usage-focused, not certification)
  - Evidence source and supporting project
  - Reference and explanation
  - Review notes/limitations
- Role matching view with requirement-by-requirement explanations
- Transparent readiness score formula
- Personalized learning roadmap derived from actual role gaps
- Recruiter-friendly passport view with:
  - Candidate summary
  - Projects and evidence-backed skills
  - Skills needing review
  - Role gap summary
  - **Copy Passport** and **Print / Save as PDF** actions

## Demo Usage
1. Open the app.
2. Keep the default demo profile or click **Load Demo Profile**.
3. Explore tabs: Dashboard, Skills, Evidence, Role Match, Learning Roadmap, Recruiter View.
4. Add your own project in the Evidence tab and click **Analyze Evidence**.
5. Review detected skill triggers, role fit, and roadmap updates.

No API key, auth, database, or external service is required.

## Evidence Status Logic
SkillPassport uses three statuses:
- **Evidence found**: multiple relevant keyword signals found in supplied project evidence
- **Needs review**: limited/ambiguous signal; requires stronger artifacts
- **No evidence**: no matching signal found in supplied evidence

Important:
- Evidence indicates **usage**, not guaranteed mastery.
- URLs and references are treated as user/demo supplied links unless independently inspected.
- The app does not auto-clone repositories or fetch external links in this MVP.

## Role Matching Logic
Each role requirement maps to a candidate evidence status and match status:
- Evidence found → **Supported match**
- Needs review → **Partial or uncertain match**
- No evidence → **Gap**

Readiness score is explicitly calculated as:

`((supported × 1) + (partial × 0.5)) / total requirements × 100`

## Current Limitations
- Skill detection is deterministic keyword matching (not deep code inspection).
- Proficiency is an evidence-based estimate, not certification.
- External repositories/URLs are not automatically analyzed.
- Role catalog is intentionally small for MVP speed.

## Future Improvements
- Deeper evidence extraction from uploaded artifacts
- Optional server-side AI reasoning with strict fallbacks
- Expanded role library and custom role builder
- Better portfolio export formats
