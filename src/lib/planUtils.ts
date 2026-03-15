import type { Plan, PlanSection, PlanVersion } from '../types';

/**
 * Trims the versions array so it never exceeds 4 entries.
 * When length > 4, the oldest version (first element) is removed.
 * Requirements: 3.4
 */
export function trimVersions(versions: PlanVersion[]): PlanVersion[] {
  if (versions.length <= 4) return versions;
  return versions.slice(versions.length - 4);
}

/**
 * Replaces the section of the same section_type if one exists, otherwise appends.
 * Requirements: 3.3
 */
export function upsertSection(
  sections: PlanSection[],
  newSection: PlanSection
): PlanSection[] {
  const idx = sections.findIndex(
    (s) => s.section_type === newSection.section_type
  );
  if (idx === -1) return [...sections, newSection];
  const updated = [...sections];
  updated[idx] = newSection;
  return updated;
}

/**
 * Returns false for empty or whitespace-only strings.
 * Requirements: 2.3
 */
export function isValidPlanName(name: string): boolean {
  return name.trim().length > 0;
}

/**
 * Returns false for strings shorter than 8 chars or whitespace-only.
 * Requirements: 1.2
 */
export function isValidPassword(password: string): boolean {
  return password.trim().length >= 8;
}

/**
 * Constructs a Groq analysis prompt from plan sections, optionally including
 * a prior analysis for context accumulation.
 * Requirements: 5.3
 */
export function buildAnalysisPrompt(
  sections: PlanSection[],
  previousAnalysis?: string
): string {
  const sectionSummaries = sections
    .map((s) => `### ${s.section_type}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n');

  const priorContext = previousAnalysis
    ? `\n\n## Previous Analysis (use as additional context)\n${previousAnalysis}`
    : '';

  return `You are YatraSathi, an expert AI travel analyst. Analyse the following travel plan sections and provide a comprehensive, intelligent overview of the trip.${priorContext}

## Plan Sections
${sectionSummaries}

Provide a detailed analysis covering:
- Overall trip summary and highlights
- Budget assessment and recommendations
- Accommodation and food insights
- Safety considerations
- Best timing and weather notes
- Personalised travel tips

Write in a friendly, informative tone suitable for a traveller.`;
}

/**
 * Constructs a Groq recommendation prompt from a user's plan summaries.
 * Requires at least 2 plans; returns null if fewer than 2 are provided.
 * Requirements: 8.3, 8.4
 */
export function buildRecommendationPrompt(plans: Plan[]): string | null {
  if (plans.length < 2) return null;

  const planSummaries = plans
    .map((p, i) => {
      const sectionTypes = (p.sections ?? [])
        .map((s) => s.section_type)
        .join(', ') || 'none';
      const analysis = p.latestAnalysis
        ? `\n  Latest Analysis: ${p.latestAnalysis.content.slice(0, 300)}...`
        : '';
      return `${i + 1}. Plan: "${p.name}"
  Destination: ${p.destination ?? 'unknown'}
  Saved Sections: ${sectionTypes}${analysis}`;
    })
    .join('\n\n');

  return `You are YatraSathi, an expert AI travel advisor. A user has ${plans.length} travel plans and wants to know which trip to take first.

## User's Travel Plans
${planSummaries}

Rank these plans from most to least recommended and provide clear reasoning for each ranking. Consider factors like completeness of planning, destination appeal, budget, and any available analysis.

Return a JSON array with this structure:
[
  {
    "rank": 1,
    "planName": "string",
    "rationale": "2-3 sentence explanation of why this plan is ranked here"
  }
]`;
}

/**
 * Constructs a system context string for the plan chat from saved sections.
 * Requirements: 6.1
 */
export function buildChatSystemPrompt(sections: PlanSection[]): string {
  if (sections.length === 0) {
    return `You are YatraSathi, an expert AI travel assistant. The user has not saved any plan sections yet. Answer general travel questions helpfully and encourage them to save plan data for more personalised responses.`;
  }

  const sectionContext = sections
    .map((s) => `### ${s.section_type}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n');

  return `You are YatraSathi, an expert AI travel assistant. You are helping a user with their specific travel plan. Answer questions based on the plan data below. Be specific, helpful, and reference the plan details when relevant.

## Plan Data
${sectionContext}`;
}
