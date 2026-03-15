# Requirements Document

## Introduction

YatraSathi currently provides AI-powered travel planning tools (trip planner, budget estimator, hotels, food guide, transport, safety, best time, weather) as stateless pages. This feature adds user authentication, persistent travel plans, AI-powered plan analysis, plan versioning, an AI chat assistant scoped to each plan, automated weather capture, and a cross-plan AI recommendation engine — all integrated into the existing React + Vite + TypeScript + Chakra UI application using Cloudflare Workers or a lightweight backend with a database (e.g. Supabase/Firebase) for persistence.

## Glossary

- **User**: A registered and authenticated person using YatraSathi.
- **Account**: A User's persistent identity record containing credentials and profile data.
- **Plan**: A named travel project created by a User that aggregates outputs from the planning pages.
- **Plan Section**: One saved output from a planning page (e.g. Trip Planner output, Budget output) stored under a Plan.
- **Plan Version**: A snapshot of a Plan's full state at a point in time; up to 4 versions are retained per Plan.
- **Analysis**: An AI-generated narrative overview of a Plan's aggregated sections, produced by the Groq AI API.
- **Plan Chat**: A conversational AI interface scoped exclusively to the data of a single Plan.
- **Weather Snapshot**: Automatically captured current weather data for both the source and destination locations of a Plan.
- **Plan Recommendation**: An AI-generated ranked ordering of all of a User's Plans, with rationale.
- **Dashboard**: The User's profile/home page showing all Plans and global actions.
- **Auth Provider**: The authentication service (e.g. Supabase Auth or Firebase Auth) used to manage User credentials.
- **Database**: The persistent storage layer (e.g. Supabase PostgreSQL or Firestore) used to store Plans, Sections, Versions, and Analyses.
- **Groq AI API**: The external AI inference API (already integrated) used for analysis, chat, and recommendations.
- **Section Type**: One of: `planner`, `budget`, `hotels`, `food`, `transport`, `safety`, `best-time`, `weather`.

---

## Requirements

### Requirement 1 — User Authentication

**User Story:** As a visitor, I want to create an account and log in, so that my travel plans are saved and accessible across sessions.

#### Acceptance Criteria

1. WHEN a visitor clicks the Sign Up option, THE System SHALL display a registration form requesting email address and password.
2. WHEN a visitor submits a valid email and password of at least 8 characters, THE System SHALL create a new Account and redirect the User to the Dashboard.
3. IF a visitor submits a registration form with an email address already associated with an existing Account, THEN THE System SHALL display an error message indicating the email is already in use.
4. WHEN a registered User submits valid login credentials, THE System SHALL authenticate the User and redirect the User to the Dashboard.
5. IF a User submits incorrect login credentials, THEN THE System SHALL display an error message and retain the email field value.
6. WHEN an authenticated User clicks the logout option, THE System SHALL terminate the session and redirect the User to the home page.
7. WHILE a User is authenticated, THE System SHALL persist the session across page refreshes without requiring re-login.

---

### Requirement 2 — Plan Creation

**User Story:** As an authenticated User, I want to create named travel plans, so that I can organise multiple trips separately.

#### Acceptance Criteria

1. WHEN an authenticated User clicks the "+" icon in the navigation bar or on the Dashboard, THE System SHALL display a prompt requesting a plan name.
2. WHEN the User submits a non-empty plan name, THE System SHALL create a new Plan with that name, assign it to the User's Account, and navigate the User to the Plan detail view.
3. IF the User submits an empty or whitespace-only plan name, THEN THE System SHALL reject the submission and display a validation error.
4. THE System SHALL display all Plans belonging to the authenticated User on the Dashboard, ordered by most recently updated.
5. WHEN a User deletes a Plan, THE System SHALL permanently remove the Plan and all associated Sections, Versions, and Analyses from the Database.

---

### Requirement 3 — Saving Page Outputs to a Plan

**User Story:** As an authenticated User, I want to save the output of any planning page to one of my Plans, so that all my research is consolidated in one place.

#### Acceptance Criteria

1. WHILE a User is authenticated, THE System SHALL display a "Save to Plan" control on each of the following pages: Trip Planner, Budget Estimator, Hotels, Food Guide, Travel Options, Safety Guide, Best Time, Weather.
2. WHEN a User selects a Plan from the "Save to Plan" control and confirms, THE System SHALL store the current page output as a Plan Section of the corresponding Section Type under the selected Plan.
3. WHEN a User saves a Section to a Plan that already contains a Section of the same Section Type, THE System SHALL replace the existing Section with the new output and create a new Plan Version snapshot before replacing.
4. THE System SHALL retain a maximum of 4 Plan Versions per Plan; WHEN a 5th Version would be created, THE System SHALL delete the oldest Version.
5. WHEN a User views a Plan, THE System SHALL display all saved Sections with their Section Type labels and the timestamp of the last save.

---

### Requirement 4 — Plan Version History

**User Story:** As an authenticated User, I want to view and restore previous versions of my plan, so that I can revert changes I am not satisfied with.

#### Acceptance Criteria

1. WHEN a User views a Plan, THE System SHALL display a version history list showing up to 4 Plan Versions with their creation timestamps.
2. WHEN a User selects a previous Plan Version to restore, THE System SHALL replace the current Plan Sections with the Sections from the selected Version and record the restoration as a new Version.
3. IF restoring a Version would exceed the 4-Version limit, THEN THE System SHALL delete the oldest Version before saving the restored state as a new Version.

---

### Requirement 5 — AI Plan Analysis

**User Story:** As an authenticated User, I want to analyse my plan with AI, so that I receive a consolidated, intelligent overview of my trip.

#### Acceptance Criteria

1. WHEN a User clicks the "Analyse" button on a Plan that contains at least one saved Section, THE System SHALL send all saved Section data for that Plan to the Groq AI API and display the resulting Analysis.
2. WHEN an Analysis is generated, THE System SHALL persist the Analysis text in the Database associated with the Plan.
3. WHEN a User clicks "Analyse" on a Plan that already has a stored Analysis, THE System SHALL include the previous Analysis text as additional context in the new Groq AI API request, so that subsequent analyses build on prior results.
4. IF a User clicks "Analyse" on a Plan with no saved Sections, THEN THE System SHALL display an informational message indicating that at least one Section must be saved before analysis.
5. WHEN the Groq AI API returns an Analysis, THE System SHALL display the Analysis in a readable formatted view within the Plan detail page.

---

### Requirement 6 — AI Plan Chat

**User Story:** As an authenticated User, I want to chat with an AI assistant about a specific plan, so that I can ask questions and get answers grounded in my plan's data.

#### Acceptance Criteria

1. WHEN a User opens the chat interface for a Plan, THE System SHALL initialise the Groq AI API conversation with all saved Section data for that Plan as system context.
2. WHEN a User sends a message in the Plan Chat, THE System SHALL send the message along with the Plan's Section data context to the Groq AI API and display the response.
3. WHILE the Plan Chat is open, THE System SHALL maintain the conversation history within the session so that follow-up questions are contextually aware.
4. IF the Plan contains no saved Sections, THEN THE System SHALL display a message informing the User that saving plan data first will improve chat responses.
5. THE System SHALL display the chat history in chronological order with clear visual distinction between User messages and AI responses.

---

### Requirement 7 — Automated Weather Capture

**User Story:** As an authenticated User, I want weather data for my trip's source and destination to be automatically saved to my plan, so that I do not have to manually fetch and save it.

#### Acceptance Criteria

1. WHEN a User saves a Trip Planner Section to a Plan that includes a source and destination location, THE System SHALL automatically fetch current weather data for both the source and destination using the existing weather API integration.
2. WHEN weather data is successfully fetched, THE System SHALL store the weather data as a Weather Snapshot within the Plan and display it in the Plan detail view.
3. IF the weather API returns an error for either location, THEN THE System SHALL store the successfully fetched location's data and display a warning for the failed location without blocking the save operation.

---

### Requirement 8 — Cross-Plan AI Recommendation

**User Story:** As an authenticated User, I want AI to rank all my plans and recommend which trip to take first, so that I can make an informed decision.

#### Acceptance Criteria

1. WHEN a User clicks the "Recommend" button on the Dashboard, THE System SHALL send the summary data of all the User's Plans to the Groq AI API and request a ranked recommendation with rationale.
2. WHEN the Groq AI API returns a recommendation, THE System SHALL display the ranked list of Plans with the AI's reasoning for each ranking on the Dashboard.
3. IF the User has fewer than 2 Plans, THEN THE System SHALL display an informational message indicating that at least 2 Plans are needed for a meaningful recommendation.
4. THE System SHALL include each Plan's name, saved Section types, destination, and most recent Analysis (if available) in the recommendation request payload.

---

### Requirement 9 — Navigation and Dashboard UI

**User Story:** As an authenticated User, I want a clear dashboard and navigation experience, so that I can manage my plans efficiently.

#### Acceptance Criteria

1. WHILE a User is authenticated, THE System SHALL display the User's avatar or initials and a "+" icon in the navigation bar.
2. WHILE a User is not authenticated, THE System SHALL display "Login" and "Sign Up" links in the navigation bar.
3. WHEN a User navigates to the Dashboard, THE System SHALL display a summary card for each Plan showing the plan name, destination (if saved), number of saved Sections, and last updated timestamp.
4. THE System SHALL provide a navigation route at "/dashboard" accessible only to authenticated Users; unauthenticated access SHALL redirect to the login page.
5. THE System SHALL provide navigation routes at "/login" and "/signup" accessible only to unauthenticated Users; authenticated access SHALL redirect to the Dashboard.
