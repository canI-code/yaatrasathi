# Implementation Plan

- [x] 1. Install dependencies and configure Supabase client





  - Install `@supabase/supabase-js` via npm
  - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env.example` and `.env`
  - Create `src/lib/supabase.ts` that initialises and exports the Supabase client
  - _Requirements: 1.1, 1.4_

- [x] 2. Extend TypeScript types





- [x] 2.1 Add plan-related types to `src/types/index.ts`


  - Add `SectionType`, `Plan`, `PlanSection`, `PlanVersion`, `PlanAnalysis`, `WeatherSnapshot` interfaces as specified in the design data models
  - _Requirements: 2.2, 3.2, 4.1, 5.2, 7.2_

- [x] 3. Implement core plan logic utilities






- [x] 3.1 Create `src/lib/planUtils.ts` with pure helper functions

  - `trimVersions(versions)` — returns array with oldest removed when length > 4
  - `upsertSection(sections, newSection)` — replaces section of same type or appends
  - `isValidPlanName(name)` — returns false for empty/whitespace-only strings
  - `isValidPassword(password)` — returns false for strings shorter than 8 chars or whitespace-only
  - `buildAnalysisPrompt(sections, previousAnalysis?)` — constructs Groq prompt including prior analysis if present
  - `buildRecommendationPrompt(plans)` — constructs Groq prompt from plan summaries
  - `buildChatSystemPrompt(sections)` — constructs system context string from plan sections
  - _Requirements: 2.3, 3.3, 3.4, 4.2, 5.3, 8.3, 8.4_

- [x] 3.2 Write property tests for plan logic utilities






  - **Property 1: Plan version count never exceeds 4** — use `fc.array` of arbitrary sections, call `trimVersions` repeatedly, assert length ≤ 4
  - **Property 2: Saved section replaces existing section of same type** — generate arbitrary section type T, call `upsertSection` twice with same type, assert result has exactly one section of type T
  - **Property 3: Plan section round-trip serialization** — generate arbitrary section data objects, JSON.stringify then JSON.parse, assert deep equality
  - **Property 4: Empty plan name rejection** — generate whitespace-only strings via `fc.stringOf(fc.constantFrom(' ','\t','\n'))`, assert `isValidPlanName` returns false
  - **Property 5: Whitespace-only password rejection** — generate whitespace-only strings, assert `isValidPassword` returns false
  - **Property 7: Analysis context accumulation** — generate arbitrary prior analysis strings, call `buildAnalysisPrompt` with prior analysis, assert returned string contains prior analysis text
  - **Property 8: Cross-plan recommendation requires ≥ 2 plans** — assert `buildRecommendationPrompt` with 0 or 1 plans returns null/throws, with ≥ 2 returns a non-empty string
  - _Requirements: 2.3, 3.3, 3.4, 5.3, 8.3_

- [x] 4. Implement AuthContext




- [x] 4.1 Create `src/contexts/AuthContext.tsx`



  - Expose `user`, `session`, `loading`, `signUp(email, password)`, `signIn(email, password)`, `signOut()` via React context
  - Subscribe to `supabase.auth.onAuthStateChange` to keep state in sync across refreshes
  - Validate password length (≥ 8) and non-whitespace before calling Supabase
  - _Requirements: 1.1, 1.2, 1.4, 1.6, 1.7_

- [x] 4.2 Wrap the app with `AuthContext` in `src/main.tsx`


  - Import and wrap `<App />` with `<AuthProvider>`
  - _Requirements: 1.7_

- [x] 5. Implement route guards and new routes



- [x] 5.1 Create `src/components/auth/ProtectedRoute.tsx` and `GuestRoute.tsx`


  - `ProtectedRoute` — redirects to `/login?redirect=<current path>` if no session
  - `GuestRoute` — redirects to `/dashboard` if session exists
  - _Requirements: 9.4, 9.5_

- [x] 5.2 Add new routes to `src/router.tsx`


  - Add `/login`, `/signup` wrapped in `GuestRoute`
  - Add `/dashboard`, `/plans/:planId` wrapped in `ProtectedRoute`
  - Lazy-import the four new page components
  - _Requirements: 9.4, 9.5_

- [x] 6. Build Login and Signup pages


- [x] 6.1 Create `src/pages/LoginPage.tsx`


  - Email + password form using existing `Button` component and `theme.ts` glass-card style
  - Calls `signIn` from `AuthContext`, shows inline error on failure, retains email field value
  - Link to `/signup`
  - _Requirements: 1.1, 1.4, 1.5_


- [x] 6.2 Create `src/pages/SignupPage.tsx`

  - Email + password form with client-side validation (email format, password ≥ 8 chars)
  - Calls `signUp` from `AuthContext`, shows inline error for duplicate email
  - Link to `/login`
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 7. Update Navbar with auth-aware user menu




- [x] 7.1 Create `src/components/layout/NavbarUserMenu.tsx`

  - When authenticated: show user initials avatar, "+" icon button (opens `CreatePlanModal`), logout option
  - When unauthenticated: show "Login" and "Sign Up" nav links
  - _Requirements: 9.1, 9.2_


- [x] 7.2 Integrate `NavbarUserMenu` into the existing `src/components/layout/Navbar.tsx`

  - Import and render `<NavbarUserMenu />` in the right section of the navbar
  - Do not remove or break any existing navbar items
  - _Requirements: 9.1, 9.2_

- [x] 8. Implement PlansContext and Supabase DB operations




- [x] 8.1 Create `src/contexts/PlansContext.tsx`

  - Expose `plans`, `loading`, `createPlan(name)`, `deletePlan(id)`, `fetchPlan(id)`, `saveSection(planId, sectionType, data)`, `restoreVersion(planId, versionId)`, `saveAnalysis(planId, content)`, `saveWeatherSnapshot(planId, sourceData, destData)`
  - `saveSection` must: snapshot current sections as a new version → call `trimVersions` to enforce ≤ 4 limit → upsert section using `upsertSection` logic → update `plans.updated_at`
  - `restoreVersion` must: snapshot current state as new version → trim → replace sections with version snapshot
  - `createPlan` must validate name with `isValidPlanName` before DB call
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 3.2, 3.3, 3.4, 4.2, 4.3, 5.2_


- [x] 8.2 Wrap the app with `PlansContext` in `src/main.tsx` (inside `AuthProvider`)

  - _Requirements: 2.4_

- [x]* 8.3 Write property test for version restore creates a new version



  - **Property 6: Version restore creates a new version** — simulate a plan with N versions (1 ≤ N ≤ 4), call restore logic, assert version count increases by 1 (then trimmed if needed)
  - **Property 9: Weather snapshot stored on planner save** — generate arbitrary non-empty source/destination strings, call `saveSection` with type `planner`, assert `saveWeatherSnapshot` is invoked
  - _Requirements: 4.2, 7.1_

- [x] 9. Create `CreatePlanModal` component


  - Create `src/components/plans/CreatePlanModal.tsx`
  - Text input for plan name, submit calls `createPlan`, shows validation error for empty/whitespace names, navigates to `/plans/:id` on success
  - _Requirements: 2.1, 2.2, 2.3_

- [-] 10. Build Dashboard page

- [x] 10.1 Create `src/pages/DashboardPage.tsx`


  - Fetch and display all user plans ordered by `updated_at` descending
  - Render a `PlanCard` for each plan
  - Show "+" button to open `CreatePlanModal`
  - Show "Recommend" button that triggers `PlanRecommendationPanel`
  - _Requirements: 2.1, 2.4, 8.1, 9.3_


- [-] 10.2 Create `src/components/plans/PlanCard.tsx`

  - Display plan name, destination (if set), count of saved sections, last updated timestamp
  - Delete button that calls `deletePlan` with confirmation
  - Clicking card navigates to `/plans/:planId`
  - _Requirements: 2.5, 9.3_


- [-] 10.3 Create `src/components/plans/PlanRecommendationPanel.tsx`

  - "Recommend" button calls `buildRecommendationPrompt` then Groq API
  - If fewer than 2 plans, show informational message without calling Groq
  - Display ranked plan list with AI rationale
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 11. Checkpoint — ensure all tests pass



  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Build Plan Detail page and sub-components


- [x] 12.1 Create `src/pages/PlanDetailPage.tsx`


  - Fetch plan by `planId` param, show 404 message if not found or not owned by user
  - Render sections list, `PlanVersionHistory`, `WeatherSnapshotCard`, `PlanAnalysisPanel`, `PlanChatPanel`
  - _Requirements: 3.5, 4.1, 5.5, 7.2_

- [x] 12.2 Create `src/components/plans/PlanVersionHistory.tsx`


  - List up to 4 versions with timestamps
  - "Restore" button per version calls `restoreVersion`
  - _Requirements: 4.1, 4.2, 4.3_


- [x] 12.3 Create `src/components/plans/WeatherSnapshotCard.tsx`

  - Display source and destination weather data from the plan's weather snapshot
  - Show warning badge if one location failed to fetch
  - _Requirements: 7.2, 7.3_


- [x] 12.4 Create `src/components/plans/PlanAnalysisPanel.tsx`

  - "Analyse" button calls `buildAnalysisPrompt` (with prior analysis if exists) then Groq API, then `saveAnalysis`
  - Show informational message if no sections saved
  - Display latest analysis in formatted view
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


- [x] 12.5 Create `src/components/plans/PlanChatPanel.tsx`

  - Initialise Groq chat with `buildChatSystemPrompt(sections)` as system message
  - Maintain message history in component state (chronological order, user vs AI visually distinct)
  - Show informational message if no sections saved
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [-] 13. Create `SaveToPlanButton` and integrate into all planning pages


- [x] 13.1 Create `src/components/plans/SaveToPlanButton.tsx`

  - Renders only when `aiOutput` prop is non-null (i.e. after AI result is available)
  - Dropdown to select from user's plans, confirm button calls `saveSection`
  - For `planner` section type, also triggers `saveWeatherSnapshot` with source/destination from the TripPlan data
  - _Requirements: 3.1, 3.2, 7.1_

- [x] 13.2 Integrate `SaveToPlanButton` into `src/pages/TripPlanner.tsx`


  - Pass `aiOutput={tripPlan}` and `sectionType="planner"` after plan is generated
  - _Requirements: 3.1, 7.1_

- [x] 13.3 Integrate `SaveToPlanButton` into `src/pages/BudgetEstimator.tsx`


  - Pass `aiOutput={budgetResult}` and `sectionType="budget"` after result is generated
  - _Requirements: 3.1_

- [x] 13.4 Integrate `SaveToPlanButton` into `src/pages/Hotels.tsx`


  - Pass `aiOutput={hotels}` and `sectionType="hotels"` after result is generated
  - _Requirements: 3.1_

- [x] 13.5 Integrate `SaveToPlanButton` into `src/pages/FoodGuide.tsx`


  - Pass `aiOutput={foodItems}` and `sectionType="food"` after result is generated
  - _Requirements: 3.1_



- [ ] 13.6 Integrate `SaveToPlanButton` into `src/pages/TravelOptions.tsx`
  - Pass `aiOutput={transportOptions}` and `sectionType="transport"` after result is generated
  - _Requirements: 3.1_


- [x] 13.7 Integrate `SaveToPlanButton` into `src/pages/SafetyGuide.tsx`

  - Pass `aiOutput={safetyTips}` and `sectionType="safety"` after result is generated
  - _Requirements: 3.1_



- [ ] 13.8 Integrate `SaveToPlanButton` into `src/pages/BestTime.tsx`
  - Pass `aiOutput={bestTimeInfo}` and `sectionType="best-time"` after result is generated
  - _Requirements: 3.1_


- [-] 13.9 Integrate `SaveToPlanButton` into `src/pages/Weather.tsx`

  - Pass `aiOutput={weatherData}` and `sectionType="weather"` after result is generated
  - _Requirements: 3.1_

- [x] 14. Add Groq AI functions for analysis, chat, and recommendations


  - Add `generatePlanAnalysis(sections, previousAnalysis?)` to `src/lib/groq.ts`
  - Add `generatePlanRecommendation(planSummaries)` to `src/lib/groq.ts`
  - Add `sendPlanChatMessage(sections, history, userMessage)` to `src/lib/groq.ts`
  - _Requirements: 5.1, 5.3, 6.1, 6.2, 8.1, 8.4_


- [x] 15. Final Checkpoint — ensure all tests pass


  - Ensure all tests pass, ask the user if questions arise.
