import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import { trimVersions, isValidPlanName } from '../lib/planUtils';
import { fetchWeather } from '../lib/weather';
import { useAuth } from './AuthContext';
import type {
  Plan,
  PlanSection,
  PlanVersion,
  PlanAnalysis,
  WeatherSnapshot,
  SectionType,
  WeatherData,
  TripPlan,
} from '../types';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface PlansContextValue {
  plans: Plan[];
  loading: boolean;
  fetchPlans: () => Promise<void>;
  fetchPlan: (id: string) => Promise<Plan | null>;
  createPlan: (name: string) => Promise<Plan | null>;
  deletePlan: (id: string) => Promise<void>;
  /** Save (upsert) a section. Snapshots the previous value as a per-section-type version. */
  saveSection: (planId: string, sectionType: SectionType, data: unknown) => Promise<void>;
  /** Restore a specific version of a specific section type. */
  restoreVersion: (planId: string, versionId: string, sectionType: SectionType) => Promise<void>;
  saveAnalysis: (planId: string, content: string) => Promise<PlanAnalysis | null>;
  saveWeatherSnapshot: (
    planId: string,
    sourceCity: string,
    destCity: string
  ) => Promise<WeatherSnapshot | null>;
}

const PlansContext = createContext<PlansContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PlansProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  // ── fetchPlans ─────────────────────────────────────────────────────────
  const fetchPlans = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) setPlans(data as Plan[]);
    setLoading(false);
  }, [user]);

  // ── fetchPlan ──────────────────────────────────────────────────────────
  const fetchPlan = useCallback(async (id: string): Promise<Plan | null> => {
    if (!user) return null;

    const [planRes, sectionsRes, versionsRes, analysisRes, weatherRes] =
      await Promise.all([
        supabase.from('plans').select('*').eq('id', id).eq('user_id', user.id).single(),
        supabase.from('plan_sections').select('*').eq('plan_id', id).order('saved_at', { ascending: true }),
        supabase.from('plan_versions').select('*').eq('plan_id', id).order('created_at', { ascending: true }),
        supabase.from('plan_analyses').select('*').eq('plan_id', id).order('created_at', { ascending: false }).limit(1),
        supabase.from('weather_snapshots').select('*').eq('plan_id', id).order('captured_at', { ascending: false }).limit(1),
      ]);

    if (planRes.error || !planRes.data) return null;

    const plan: Plan = {
      ...(planRes.data as Plan),
      sections: (sectionsRes.data ?? []) as PlanSection[],
      versions: (versionsRes.data ?? []) as PlanVersion[],
      latestAnalysis: analysisRes.data?.[0] as PlanAnalysis | undefined,
      weatherSnapshot: weatherRes.data?.[0] as WeatherSnapshot | undefined,
    };

    return plan;
  }, [user]);

  // ── createPlan ─────────────────────────────────────────────────────────
  const createPlan = useCallback(async (name: string): Promise<Plan | null> => {
    if (!user) return null;
    if (!isValidPlanName(name)) return null;

    const { data, error } = await supabase
      .from('plans')
      .insert({ name: name.trim(), user_id: user.id })
      .select()
      .single();

    if (error || !data) return null;

    const newPlan = data as Plan;
    setPlans((prev) => [newPlan, ...prev]);
    return newPlan;
  }, [user]);

  // ── deletePlan ─────────────────────────────────────────────────────────
  const deletePlan = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('plans').delete().eq('id', id).eq('user_id', user.id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }, [user]);

  // ── saveSection ────────────────────────────────────────────────────────
  // Per-section-type versioning: each section type keeps its own ≤4 version history.
  const saveSection = useCallback(
    async (planId: string, sectionType: SectionType, data: unknown) => {
      if (!user) return;

      // 1. Fetch the current section of this type (if any) and its versions
      const [sectionRes, versionsRes] = await Promise.all([
        supabase
          .from('plan_sections')
          .select('*')
          .eq('plan_id', planId)
          .eq('section_type', sectionType)
          .maybeSingle(),
        supabase
          .from('plan_versions')
          .select('*')
          .eq('plan_id', planId)
          .eq('section_type', sectionType)
          .order('created_at', { ascending: true }),
      ]);

      const existingSection = sectionRes.data as PlanSection | null;
      const currentVersions = (versionsRes.data ?? []) as PlanVersion[];

      // 2. If a previous value exists, snapshot it as a new version for this section type
      if (existingSection) {
        const { data: newVersionData } = await supabase
          .from('plan_versions')
          .insert({
            plan_id: planId,
            section_type: sectionType,
            snapshot: existingSection.data,
          })
          .select()
          .single();

        // 3. Enforce ≤ 4 versions per section type
        const allVersions = newVersionData
          ? [...currentVersions, newVersionData as PlanVersion]
          : currentVersions;

        const trimmed = trimVersions(allVersions);
        const toDelete = allVersions.filter((v) => !trimmed.find((t) => t.id === v.id));
        if (toDelete.length > 0) {
          await supabase
            .from('plan_versions')
            .delete()
            .in('id', toDelete.map((v) => v.id));
        }

        // 4. Update the existing section
        await supabase
          .from('plan_sections')
          .update({ data, saved_at: new Date().toISOString() })
          .eq('id', existingSection.id);
      } else {
        // 4. Insert new section (no previous value to snapshot)
        await supabase
          .from('plan_sections')
          .insert({ plan_id: planId, section_type: sectionType, data });
      }

      // 5. Touch updated_at on the plan
      await supabase
        .from('plans')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', planId);

      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId ? { ...p, updated_at: new Date().toISOString() } : p
        )
      );
    },
    [user]
  );

  // ── restoreVersion ─────────────────────────────────────────────────────
  // Restores a specific section type to a previous snapshot.
  const restoreVersion = useCallback(
    async (planId: string, versionId: string, sectionType: SectionType) => {
      if (!user) return;

      // 1. Fetch the version to restore
      const [versionRes, sectionRes, versionsRes] = await Promise.all([
        supabase.from('plan_versions').select('*').eq('id', versionId).single(),
        supabase
          .from('plan_sections')
          .select('*')
          .eq('plan_id', planId)
          .eq('section_type', sectionType)
          .maybeSingle(),
        supabase
          .from('plan_versions')
          .select('*')
          .eq('plan_id', planId)
          .eq('section_type', sectionType)
          .order('created_at', { ascending: true }),
      ]);

      if (versionRes.error || !versionRes.data) return;

      const targetVersion = versionRes.data as PlanVersion;
      const existingSection = sectionRes.data as PlanSection | null;
      const currentVersions = (versionsRes.data ?? []) as PlanVersion[];

      // 2. Snapshot the current section data before restoring
      if (existingSection) {
        const { data: newVersionData } = await supabase
          .from('plan_versions')
          .insert({
            plan_id: planId,
            section_type: sectionType,
            snapshot: existingSection.data,
          })
          .select()
          .single();

        // 3. Enforce ≤ 4 versions
        const allVersions = newVersionData
          ? [...currentVersions, newVersionData as PlanVersion]
          : currentVersions;
        const trimmed = trimVersions(allVersions);
        const toDelete = allVersions.filter((v) => !trimmed.find((t) => t.id === v.id));
        if (toDelete.length > 0) {
          await supabase
            .from('plan_versions')
            .delete()
            .in('id', toDelete.map((v) => v.id));
        }

        // 4. Update the section with the restored snapshot data
        await supabase
          .from('plan_sections')
          .update({ data: targetVersion.snapshot, saved_at: new Date().toISOString() })
          .eq('id', existingSection.id);
      } else {
        // Section was deleted — re-insert it
        await supabase
          .from('plan_sections')
          .insert({
            plan_id: planId,
            section_type: sectionType,
            data: targetVersion.snapshot,
          });
      }

      // 5. Touch updated_at
      await supabase
        .from('plans')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', planId);
    },
    [user]
  );

  // ── saveAnalysis ───────────────────────────────────────────────────────
  const saveAnalysis = useCallback(
    async (planId: string, content: string): Promise<PlanAnalysis | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('plan_analyses')
        .insert({ plan_id: planId, content })
        .select()
        .single();

      if (error || !data) return null;
      return data as PlanAnalysis;
    },
    [user]
  );

  // ── saveWeatherSnapshot ────────────────────────────────────────────────
  const saveWeatherSnapshot = useCallback(
    async (
      planId: string,
      sourceCity: string,
      destCity: string
    ): Promise<WeatherSnapshot | null> => {
      if (!user) return null;

      const [sourceResult, destResult] = await Promise.allSettled([
        fetchWeather(sourceCity),
        fetchWeather(destCity),
      ]);

      const sourceData: WeatherData | null =
        sourceResult.status === 'fulfilled' ? sourceResult.value : null;
      const destData: WeatherData | null =
        destResult.status === 'fulfilled' ? destResult.value : null;

      const { data, error } = await supabase
        .from('weather_snapshots')
        .insert({ plan_id: planId, source_data: sourceData, dest_data: destData })
        .select()
        .single();

      if (error || !data) return null;
      return data as WeatherSnapshot;
    },
    [user]
  );

  return (
    <PlansContext.Provider
      value={{
        plans,
        loading,
        fetchPlans,
        fetchPlan,
        createPlan,
        deletePlan,
        saveSection,
        restoreVersion,
        saveAnalysis,
        saveWeatherSnapshot,
      }}
    >
      {children}
    </PlansContext.Provider>
  );
}

export function usePlans(): PlansContextValue {
  const ctx = useContext(PlansContext);
  if (!ctx) throw new Error('usePlans must be used within a PlansProvider');
  return ctx;
}

// Helper: extract source/destination from a TripPlan section data for weather capture
export function extractTripLocations(data: unknown): { source: string; dest: string } | null {
  const plan = data as Partial<TripPlan>;
  if (plan?.source && plan?.destination) {
    return { source: plan.source, dest: plan.destination };
  }
  return null;
}
