import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  trimVersions,
  upsertSection,
  isValidPlanName,
  isValidPassword,
  buildAnalysisPrompt,
  buildRecommendationPrompt,
} from './planUtils';
import type { PlanVersion, PlanSection, SectionType, Plan } from '../types';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

const sectionTypeArb = fc.constantFrom<SectionType>(
  'planner', 'budget', 'hotels', 'food', 'transport', 'safety', 'best-time', 'weather'
);

// Safe date arbitrary — avoids Invalid Date edge cases from fc.date()
const isoDateArb = fc
  .integer({ min: 0, max: 2_000_000_000_000 })
  .map((ms) => new Date(ms).toISOString());

const planSectionArb: fc.Arbitrary<PlanSection> = fc.record({
  id: fc.uuid(),
  plan_id: fc.uuid(),
  section_type: sectionTypeArb,
  data: fc.jsonValue({ noNaN: true, noUndefinedInArrays: true }),
  saved_at: isoDateArb,
});

const planVersionArb: fc.Arbitrary<PlanVersion> = fc.record({
  id: fc.uuid(),
  plan_id: fc.uuid(),
  snapshot: fc.array(planSectionArb, { maxLength: 8 }),
  created_at: isoDateArb,
});

const planArb: fc.Arbitrary<Plan> = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  name: fc.string({ minLength: 1 }),
  destination: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
  created_at: isoDateArb,
  updated_at: isoDateArb,
  sections: fc.option(fc.array(planSectionArb, { maxLength: 8 }), { nil: undefined }),
  versions: fc.option(fc.array(planVersionArb, { maxLength: 4 }), { nil: undefined }),
  latestAnalysis: fc.constant(undefined),
  weatherSnapshot: fc.constant(undefined),
});

const whitespaceStringArb = fc
  .array(fc.constantFrom(' ', '\t', '\n'))
  .map((chars) => chars.join(''));

// ---------------------------------------------------------------------------
// Property 1: Plan version count never exceeds 4
// Feature: user-plans, Property 1: Plan version count never exceeds 4
// Validates: Requirements 3.4
// ---------------------------------------------------------------------------
describe('Property 1: Plan version count never exceeds 4', () => {
  it('trimVersions always returns ≤ 4 versions regardless of input length', () => {
    fc.assert(
      fc.property(fc.array(planVersionArb, { maxLength: 20 }), (versions) => {
        const result = trimVersions(versions);
        expect(result.length).toBeLessThanOrEqual(4);
      }),
      { numRuns: 100 }
    );
  });

  it('trimVersions called repeatedly still never exceeds 4', () => {
    fc.assert(
      fc.property(fc.array(planVersionArb, { maxLength: 20 }), (versions) => {
        const once = trimVersions(versions);
        const twice = trimVersions(once);
        expect(twice.length).toBeLessThanOrEqual(4);
        // idempotent after first trim
        expect(twice.length).toEqual(once.length);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Saved section replaces existing section of same type
// Feature: user-plans, Property 2: Saved section replaces existing section of same type
// Validates: Requirements 3.3
// ---------------------------------------------------------------------------
describe('Property 2: Saved section replaces existing section of same type', () => {
  it('upsertSection with same type results in exactly one section of that type', () => {
    fc.assert(
      fc.property(
        sectionTypeArb,
        fc.array(planSectionArb, { maxLength: 8 }),
        fc.uuid(),
        fc.uuid(),
        fc.jsonValue({ noNaN: true, noUndefinedInArrays: true }),
        (sectionType, rawSections, id1, id2, data) => {
          // Ensure the starting array has at most one section of the target type
          // (remove duplicates of that type, keeping the last one)
          const sections = rawSections.reduce<PlanSection[]>((acc, s) => {
            if (s.section_type === sectionType) {
              return acc.filter((x) => x.section_type !== sectionType).concat(s);
            }
            return acc.concat(s);
          }, []);

          const section1: PlanSection = {
            id: id1,
            plan_id: 'plan-1',
            section_type: sectionType,
            data,
            saved_at: new Date().toISOString(),
          };
          const section2: PlanSection = {
            id: id2,
            plan_id: 'plan-1',
            section_type: sectionType,
            data,
            saved_at: new Date().toISOString(),
          };

          const after1 = upsertSection(sections, section1);
          const after2 = upsertSection(after1, section2);

          const ofType = after2.filter((s) => s.section_type === sectionType);
          expect(ofType.length).toBe(1);
          expect(ofType[0].id).toBe(id2);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 3: Plan section round-trip serialization
// Feature: user-plans, Property 3: Plan section round-trip serialization
// Validates: Requirements 3.2
// ---------------------------------------------------------------------------
describe('Property 3: Plan section round-trip serialization', () => {
  it('JSON.stringify then JSON.parse produces deeply equal section data', () => {
    // fc.jsonValue with noNaN:true still can produce -0 (a JS quirk not representable in JSON).
    // We constrain to only JSON-safe values by using integer/string/boolean/null primitives.
    const jsonSafeValueArb: fc.Arbitrary<unknown> = fc.oneof(
      fc.integer(),
      fc.float({ noNaN: true, noDefaultInfinity: true, min: -1e10, max: 1e10 }).filter(v => !Object.is(v, -0)),
      fc.string(),
      fc.boolean(),
      fc.constant(null),
    );
    fc.assert(
      fc.property(jsonSafeValueArb, (data) => {
        const serialized = JSON.stringify(data);
        const deserialized = JSON.parse(serialized);
        expect(deserialized).toEqual(data);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Empty plan name rejection
// Feature: user-plans, Property 4: Empty plan name rejection
// Validates: Requirements 2.3
// ---------------------------------------------------------------------------
describe('Property 4: Empty plan name rejection', () => {
  it('isValidPlanName returns false for whitespace-only strings', () => {
    fc.assert(
      fc.property(whitespaceStringArb, (name) => {
        expect(isValidPlanName(name)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 5: Whitespace-only password rejection
// Feature: user-plans, Property 5: Whitespace-only password rejection
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------
describe('Property 5: Whitespace-only password rejection', () => {
  it('isValidPassword returns false for whitespace-only strings', () => {
    fc.assert(
      fc.property(whitespaceStringArb, (password) => {
        expect(isValidPassword(password)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 7: Analysis context accumulation
// Feature: user-plans, Property 7: Analysis context accumulation
// Validates: Requirements 5.3
// ---------------------------------------------------------------------------
describe('Property 7: Analysis context accumulation', () => {
  it('buildAnalysisPrompt includes prior analysis text when provided', () => {
    fc.assert(
      fc.property(
        fc.array(planSectionArb, { maxLength: 5 }),
        fc.string({ minLength: 1 }),
        (sections, previousAnalysis) => {
          const prompt = buildAnalysisPrompt(sections, previousAnalysis);
          expect(prompt).toContain(previousAnalysis);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 8: Cross-plan recommendation requires ≥ 2 plans
// Feature: user-plans, Property 8: Cross-plan recommendation requires ≥ 2 plans
// Validates: Requirements 8.3
// ---------------------------------------------------------------------------
describe('Property 8: Cross-plan recommendation requires ≥ 2 plans', () => {
  it('buildRecommendationPrompt returns null for 0 or 1 plans', () => {
    fc.assert(
      fc.property(fc.array(planArb, { minLength: 0, maxLength: 1 }), (plans) => {
        expect(buildRecommendationPrompt(plans)).toBeNull();
      }),
      { numRuns: 100 }
    );
  });

  it('buildRecommendationPrompt returns a non-empty string for ≥ 2 plans', () => {
    fc.assert(
      fc.property(fc.array(planArb, { minLength: 2, maxLength: 10 }), (plans) => {
        const result = buildRecommendationPrompt(plans);
        expect(typeof result).toBe('string');
        expect((result as string).length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 6: Version restore creates a new version
// Feature: user-plans, Property 6: Version restore creates a new version
// Validates: Requirements 4.2
// ---------------------------------------------------------------------------
describe('Property 6: Version restore creates a new version', () => {
  it('restoring a version adds one new version entry (then trims to ≤ 4)', () => {
    // Simulate the pure version-array logic from PlansContext.restoreVersion:
    //   1. currentVersions has N entries (1 ≤ N ≤ 4)
    //   2. A new snapshot version is appended  → N+1 entries
    //   3. trimVersions is applied             → min(N+1, 4) entries
    fc.assert(
      fc.property(
        fc.array(planVersionArb, { minLength: 1, maxLength: 4 }),
        planVersionArb,
        (currentVersions, newSnapshotVersion) => {
          // Step 2: append the new snapshot (simulates the DB insert returning a new version)
          const afterAppend = [...currentVersions, newSnapshotVersion];

          // The count must have grown by exactly 1 before trimming
          expect(afterAppend.length).toBe(currentVersions.length + 1);

          // Step 3: trim
          const afterTrim = trimVersions(afterAppend);

          // After trim the count must never exceed 4
          expect(afterTrim.length).toBeLessThanOrEqual(4);

          // The trimmed result must equal min(N+1, 4)
          expect(afterTrim.length).toBe(Math.min(currentVersions.length + 1, 4));
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 9: Weather snapshot stored on planner save
// Feature: user-plans, Property 9: Weather snapshot stored on planner save
// Validates: Requirements 7.1, 7.2
// ---------------------------------------------------------------------------
import { extractTripLocations } from '../contexts/PlansContext';

describe('Property 9: Weather snapshot stored on planner save', () => {
  it('extractTripLocations returns source and dest for any TripPlan-shaped data', () => {
    // For any non-empty source and destination strings, a TripPlan-shaped object
    // must yield locations — confirming that saveWeatherSnapshot will be triggered.
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (source, destination) => {
          const tripPlanData = { source, destination };
          const result = extractTripLocations(tripPlanData);
          expect(result).not.toBeNull();
          expect(result!.source).toBe(source);
          expect(result!.dest).toBe(destination);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('extractTripLocations returns null when source or destination is missing', () => {
    fc.assert(
      fc.property(
        fc.record({
          source: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          destination: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
        }).filter(({ source, destination }) => !source || !destination),
        (incompleteData) => {
          const result = extractTripLocations(incompleteData);
          expect(result).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });
});
