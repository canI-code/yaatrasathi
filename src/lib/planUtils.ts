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
    ? `\n\n## Previous Analysis JSON (use as additional context, do not repeat)\n${previousAnalysis}`
    : '';

  return `You are YatraSathi, an expert AI travel analyst. Analyse the following travel plan sections and return a structured JSON analysis.${priorContext}

## Plan Sections
${sectionSummaries}

Return ONLY a valid JSON object with this EXACT structure (no markdown, no prose outside JSON):
{
  "tripSummary": {
    "from": "source city or unknown",
    "to": "destination city or unknown",
    "days": <number or null>,
    "travelers": <number or null>,
    "style": "travel style or unknown",
    "totalCost": <number or null>,
    "currency": "INR"
  },
  "budgetBreakdown": [
    { "category": "string", "amount": <number>, "percentage": <number> }
  ],
  "budgetWarnings": ["warning string if any"],
  "budgetTips": ["tip 1", "tip 2"],
  "accommodation": {
    "name": "hotel name or null",
    "location": "area or null",
    "pricePerNight": <number or null>,
    "notes": "brief note"
  },
  "topFoods": ["dish 1", "dish 2", "dish 3"],
  "safetyLevel": "safe|moderate|high",
  "safetyWarnings": ["warning if any"],
  "safetyTips": ["tip 1", "tip 2"],
  "bestTimeToVisit": "e.g. October to February",
  "weatherNotes": ["note 1", "note 2"],
  "topTips": ["tip 1", "tip 2", "tip 3"],
  "highlights": ["highlight 1", "highlight 2", "highlight 3"]
}`;
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

Return a JSON object with this exact structure containing a "rankedPlans" array:
{
  "rankedPlans": [
    {
      "rank": 1,
      "planName": "string",
      "rationale": "2-3 sentence explanation of why this plan is ranked here"
    }
  ]
}`;
}

/**
 * Constructs a system context string for the plan chat from saved sections.
 * Requirements: 6.1
 */
export function buildChatSystemPrompt(sections: PlanSection[]): string {
  if (sections.length === 0) {
    return `You are YatraSathi, an expert AI travel assistant with deep knowledge of Indian and international destinations. Answer general travel questions helpfully and encourage the user to save plan data for more personalised responses.`;
  }

  // Extract destination info from planner section if available
  const plannerSection = sections.find((s) => s.section_type === 'planner');
  const planner = plannerSection?.data as Record<string, unknown> | undefined;
  const destination = (planner?.destination as string) ?? null;
  const source = (planner?.source as string) ?? null;

  const sectionContext = sections
    .map((s) => `### ${s.section_type}\n${JSON.stringify(s.data, null, 2)}`)
    .join('\n\n');

  const destinationLine = destination
    ? `The user is planning a trip to ${destination}${source ? ` from ${source}` : ''}.`
    : '';

  return `You are YatraSathi, an expert AI travel assistant with deep, up-to-date knowledge of Indian and international destinations, landmarks, distances, transport, food, culture, and local tips.

${destinationLine}

IMPORTANT RULES:
- Answer ALL questions about the destination city/state using your own knowledge — distances between landmarks, local attractions, transport options, food, culture, safety, weather, etc.
- Never say you don't know about a place unless it genuinely does not exist. Bharat Mandapam, for example, is a real convention centre in New Delhi near Pragati Maidan.
- When asked about distances, give approximate real-world distances and travel times.
- Reference the user's saved plan data when relevant, but also draw on your general knowledge freely.
- Be concise and direct — no filler phrases like "Great question!" or "I'm excited to help".
- If the user asks something completely unrelated to travel or to the destination in their plan (e.g. distances between cities not in their plan, general knowledge questions unrelated to travel), politely say: "That's outside the scope of this plan. For general questions, use the YatraSathi General Chat (the chat icon on the right side of the screen)."

## User's Saved Plan Data
${sectionContext}`;
}
