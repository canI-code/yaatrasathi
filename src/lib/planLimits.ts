export type PlanTier = 'free' | 'basic' | 'pro';

export interface PlanLimits {
  aiQueriesPerDay: number;   // -1 = unlimited
  chatMsgsPerDay: number;    // -1 = unlimited
  maxPlans: number;          // -1 = unlimited
  canSaveSections: boolean;
  canUseVersionHistory: boolean;
  canUseAnalysis: boolean;
  canUsePlanChat: boolean;
  canUseCrossplanRec: boolean;
  canExportPDF: boolean;
  canUseGeneralChat: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    aiQueriesPerDay: 5,
    chatMsgsPerDay: 0,
    maxPlans: 1,
    canSaveSections: false,
    canUseVersionHistory: false,
    canUseAnalysis: false,
    canUsePlanChat: false,
    canUseCrossplanRec: false,
    canExportPDF: false,
    canUseGeneralChat: false,
  },
  basic: {
    aiQueriesPerDay: 50,
    chatMsgsPerDay: 100,
    maxPlans: 10,
    canSaveSections: true,
    canUseVersionHistory: true,
    canUseAnalysis: true,
    canUsePlanChat: true,
    canUseCrossplanRec: false,
    canExportPDF: true,
    canUseGeneralChat: true,
  },
  pro: {
    aiQueriesPerDay: -1,
    chatMsgsPerDay: -1,
    maxPlans: -1,
    canSaveSections: true,
    canUseVersionHistory: true,
    canUseAnalysis: true,
    canUsePlanChat: true,
    canUseCrossplanRec: true,
    canExportPDF: true,
    canUseGeneralChat: true,
  },
};

export type FeatureKey = keyof Omit<PlanLimits, 'aiQueriesPerDay' | 'chatMsgsPerDay' | 'maxPlans'>;

export const UPGRADE_MESSAGES: Record<string, { title: string; description: string }> = {
  canSaveSections:      { title: "Save to Plan requires Basic or Pro", description: "Upgrade to save AI results to your travel plans and access them anytime." },
  canUseAnalysis:       { title: "AI Analysis requires Basic or Pro", description: "Upgrade to get intelligent AI-powered analysis of your complete travel plan." },
  canUsePlanChat:       { title: "Plan Chat requires Basic or Pro", description: "Upgrade to chat with an AI assistant that knows your specific travel plan." },
  canUseCrossplanRec:   { title: "Recommendations require Pro", description: "Upgrade to Pro to get AI-ranked recommendations across all your travel plans." },
  canExportPDF:         { title: "PDF Export requires Basic or Pro", description: "Upgrade to download your travel plans as beautifully formatted PDFs." },
  canUseGeneralChat:    { title: "General Chat requires Basic or Pro", description: "Upgrade to access the YatraSathi AI chat assistant for unlimited travel queries." },
  aiQueriesPerDay:      { title: "Daily AI limit reached", description: "You've used all your free AI queries for today. Upgrade for more." },
  chatMsgsPerDay:       { title: "Daily chat limit reached", description: "You've reached your daily chat message limit. Upgrade for more." },
  maxPlans:             { title: "Plan limit reached", description: "You've reached the maximum number of saved plans on your current plan." },
};
