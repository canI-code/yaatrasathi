
# ✈️ YatraSathi — AI Travel Planner

> Your intelligent travel companion powered by Groq AI. Plan complete trips, estimate budgets, discover hotels, food, transport options, safety guides, and explore interactive maps — all in one place.

[![Built with React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org)
[![Powered by Groq](https://img.shields.io/badge/AI-Groq-orange)](https://groq.com)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green?logo=supabase)](https://supabase.com)

---

## 🌟 Features

| Feature | Description |
|---|---|
| ✈️ **AI Trip Planner** | Full day-by-day itinerary with activities, food, transport & costs |
| 💰 **Budget Estimator** | Detailed cost breakdown with money-saving tips |
| 🏨 **Hotels & Stays** | AI-curated hotel recommendations with ratings |
| 🍽️ **Food Guide** | Local dishes filtered by type, spice level & budget |
| 🚗 **Travel Options** | Real transport options between cities (no hallucinations) |
| 🛡️ **Safety Guide** | Location-specific safety report with area guide & emergency contacts |
| 📅 **Best Time to Visit** | Seasonal analysis with pros/cons and ratings |
| 🌤️ **Live Weather** | Real-time weather + AI travel impact analysis |
| 🗺️ **Interactive Map** | Leaflet map with AI tourist spots, routing, measurement tools |
| 💾 **Travel Plans** | Save AI outputs to named plans with version history |
| 🤖 **Plan Analysis** | AI analysis of your complete travel plan |
| 💬 **Plan Chat** | AI chat assistant scoped to your specific plan |
| 🏆 **Trip Recommendations** | AI ranks your plans to suggest which trip to take first |
| 💡 **General AI Chat** | Persistent multi-session travel chatbot |
| 💳 **Subscription Plans** | Free / Basic / Pro tiers with Razorpay payment |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Custom glass-morphism design system (no UI library)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Auth & DB**: Supabase (PostgreSQL + Row Level Security)
- **Maps**: Leaflet.js (free, no API key needed)
- **Weather**: OpenWeatherMap API
- **Payments**: Razorpay (fake demo mode for hackathon)
- **Animations**: Framer Motion

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- Groq API key (free at [console.groq.com](https://console.groq.com))
- OpenWeatherMap API key (free at [openweathermap.org](https://openweathermap.org))

### Installation

```bash
git clone https://github.com/your-username/yatrasathi.git
cd yatrasathi
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

```env
VITE_GROQ_API_KEY=your_groq_key
VITE_OPENWEATHER_API_KEY=your_openweather_key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### Database Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Plans
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, destination TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Sections
CREATE TABLE plan_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, data JSONB NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Versions (per section type)
CREATE TABLE plan_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Plan Analyses
CREATE TABLE plan_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  content TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weather Snapshots
CREATE TABLE weather_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  source_data JSONB, dest_data JSONB,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free', status TEXT NOT NULL DEFAULT 'active',
  period TEXT NOT NULL DEFAULT 'monthly',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ,
  razorpay_subscription_id TEXT
);

-- Usage Logs
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_queries INT NOT NULL DEFAULT 0, chat_msgs INT NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL, age INT NOT NULL, phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users own their plans" ON plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their sections" ON plan_sections FOR ALL USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));
CREATE POLICY "Users own their versions" ON plan_versions FOR ALL USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));
CREATE POLICY "Users own their analyses" ON plan_analyses FOR ALL USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));
CREATE POLICY "Users own their weather" ON weather_snapshots FOR ALL USING (plan_id IN (SELECT id FROM plans WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own subscription" ON subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own usage" ON usage_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # ProtectedRoute, GuestRoute
│   ├── chat/          # GeneralChat (persistent AI chatbot)
│   ├── layout/        # Navbar, Footer, NavbarUserMenu
│   ├── paywall/       # UpgradeModal, FeatureGate, PaymentButton, FakePaymentModal
│   ├── plans/         # PlanCard, SaveToPlanButton, PlanAnalysisPanel, PlanChatPanel...
│   ├── shared/        # SaveReminderBanner
│   └── ui/            # Button, Input, Card, Select, Loader...
├── contexts/
│   ├── AuthContext.tsx
│   ├── PlansContext.tsx
│   └── SubscriptionContext.tsx
├── hooks/
│   ├── useAIQuota.ts
│   └── useUnsavedWarning.ts
├── lib/
│   ├── groq.ts        # All Groq AI functions
│   ├── leafletMap.ts  # Map utilities
│   ├── planLimits.ts  # Subscription tier limits
│   ├── planUtils.ts   # Pure helper functions
│   ├── razorpay.ts    # Payment integration
│   ├── supabase.ts    # Supabase client
│   └── weather.ts     # OpenWeatherMap integration
└── pages/
    ├── Home.tsx
    ├── TripPlanner.tsx
    ├── BudgetEstimator.tsx
    ├── Hotels.tsx
    ├── FoodGuide.tsx
    ├── TravelOptions.tsx
    ├── SafetyGuide.tsx
    ├── BestTime.tsx
    ├── Weather.tsx
    ├── ExploreMap.tsx
    ├── DashboardPage.tsx
    ├── PlanDetailPage.tsx
    ├── PricingPage.tsx
    └── ProfilePage.tsx
```

---

## 💳 Subscription Plans

| Feature | Free | Basic (₹199/mo) | Pro (₹499/mo) |
|---|---|---|---|
| AI queries/day | 5 | 50 | Unlimited |
| Saved plans | 1 | 10 | Unlimited |
| Save to plan | ❌ | ✅ | ✅ |
| AI Analysis | ❌ | ✅ | ✅ |
| Plan Chat | ❌ | ✅ | ✅ |
| Cross-plan Rec. | ❌ | ❌ | ✅ |
| General AI Chat | ❌ | ✅ | ✅ |
| PDF Export | ❌ | ✅ | ✅ |

---

## 🏆 Built For

**Cylsys AI Hackathon 2025** — Powered by Groq · Leaflet · Supabase · OpenWeatherMap

---

## 📄 License

MIT License — feel free to use, modify and distribute.
