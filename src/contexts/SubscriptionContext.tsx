import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { PLAN_LIMITS, type PlanTier, type FeatureKey } from '../lib/planLimits';

interface UsageLog {
  ai_queries: number;
  chat_msgs: number;
}

interface SubscriptionContextValue {
  plan: PlanTier;
  loading: boolean;
  usage: UsageLog;
  /** Check if the user can use a boolean feature */
  canUse: (feature: FeatureKey) => boolean;
  /** Check if the user has remaining AI queries today */
  hasAIQuota: () => boolean;
  /** Check if the user has remaining chat messages today */
  hasChatQuota: () => boolean;
  /** Check if the user can create another plan */
  canCreatePlan: (currentCount: number) => boolean;
  /** Increment AI query count — call before each Groq API call */
  incrementAIUsage: () => Promise<boolean>;
  /** Increment chat message count */
  incrementChatUsage: () => Promise<boolean>;
  /** Refresh subscription from DB */
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanTier>('free');
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageLog>({ ai_queries: 0, chat_msgs: 0 });

  const fetchSubscription = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];

    const [subRes, usageRes] = await Promise.all([
      supabase.from('subscriptions').select('plan, status, expires_at').eq('user_id', user.id).maybeSingle(),
      supabase.from('usage_logs').select('ai_queries, chat_msgs').eq('user_id', user.id).eq('date', today).maybeSingle(),
    ]);

    // Determine effective plan
    let effectivePlan: PlanTier = 'free';
    if (subRes.data) {
      const { plan: p, status, expires_at } = subRes.data;
      const isActive = status === 'active' && (!expires_at || new Date(expires_at) > new Date());
      if (isActive && (p === 'basic' || p === 'pro')) effectivePlan = p as PlanTier;
    }

    setPlan(effectivePlan);
    localStorage.setItem('ys_plan_tier', effectivePlan);
    setUsage({ ai_queries: usageRes.data?.ai_queries ?? 0, chat_msgs: usageRes.data?.chat_msgs ?? 0 });
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const limits = PLAN_LIMITS[plan];

  const canUse = useCallback((feature: FeatureKey): boolean => {
    return limits[feature] as boolean;
  }, [limits]);

  const hasAIQuota = useCallback((): boolean => {
    if (limits.aiQueriesPerDay === -1) return true;
    return usage.ai_queries < limits.aiQueriesPerDay;
  }, [limits, usage]);

  const hasChatQuota = useCallback((): boolean => {
    if (limits.chatMsgsPerDay === -1) return true;
    return usage.chat_msgs < limits.chatMsgsPerDay;
  }, [limits, usage]);

  const canCreatePlan = useCallback((currentCount: number): boolean => {
    if (limits.maxPlans === -1) return true;
    return currentCount < limits.maxPlans;
  }, [limits]);

  const incrementAIUsage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (!hasAIQuota()) return false;

    const today = new Date().toISOString().split('T')[0];
    const newCount = usage.ai_queries + 1;

    await supabase.from('usage_logs').upsert(
      { user_id: user.id, date: today, ai_queries: newCount, chat_msgs: usage.chat_msgs },
      { onConflict: 'user_id,date' }
    );

    setUsage((prev) => ({ ...prev, ai_queries: newCount }));
    return true;
  }, [user, usage, hasAIQuota]);

  const incrementChatUsage = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    if (!hasChatQuota()) return false;

    const today = new Date().toISOString().split('T')[0];
    const newCount = usage.chat_msgs + 1;

    await supabase.from('usage_logs').upsert(
      { user_id: user.id, date: today, ai_queries: usage.ai_queries, chat_msgs: newCount },
      { onConflict: 'user_id,date' }
    );

    setUsage((prev) => ({ ...prev, chat_msgs: newCount }));
    return true;
  }, [user, usage, hasChatQuota]);

  return (
    <SubscriptionContext.Provider value={{
      plan, loading, usage,
      canUse, hasAIQuota, hasChatQuota, canCreatePlan,
      incrementAIUsage, incrementChatUsage,
      refresh: fetchSubscription,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within a SubscriptionProvider');
  return ctx;
}
