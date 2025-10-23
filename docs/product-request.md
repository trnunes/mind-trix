# Mind Trix Product Request

## 1. Context & Vision
Mind Trix is a React web app that lets people brainstorm and organize ideas by mixing AI-generated and manual mind-map creation, backed by Firebase for persistence.【F:src/App.js†L1-L159】【F:src/components/MindMap.js†L8-L123】 The experience targets self-directed planners, students, and knowledge workers who want to quickly capture a main idea, branch out with relevant subtopics, and annotate thoughts with inline notes.【F:src/components/WizardDialog.js†L3-L190】【F:src/components/Node.js†L73-L183】 Donations and light analytics are wired in to sustain the product without aggressive monetization.【F:src/App.js†L289-L355】【F:src/components/DonationDialog.js†L4-L55】【F:src/components/DonationPanel.js†L4-L45】【F:src/App.js†L15-L19】

## 2. Current Experience Snapshot
- **Authentication & Onboarding** – The app tracks Firebase auth state, surfaces login/sign-up forms, and clears local data on logout.【F:src/App.js†L35-L94】【F:src/components/Login.js†L6-L94】【F:src/components/SignUp.js†L7-L100】 Logged-out users who attempt to create/import maps are redirected to the auth flow.【F:src/App.js†L71-L203】 
- **Mind Map Lifecycle** – When the wizard completes, a `mindMap` document (`title`, `userId`, `children`, `notes`) is created in Firestore and selected for editing.【F:src/App.js†L95-L138】 Users can switch maps, export/import JSON, and delete with confirmation.【F:src/App.js†L149-L223】 
- **Generative Assistance** – Subtopics are fetched from OpenAI’s Chat Completions API using contextual prompts; missing API keys trigger a modal before generation resumes.【F:src/components/MindMap.js†L32-L187】【F:src/api/chatgpt.js†L1-L42】【F:src/components/ApiKeyDialog.js†L3-L35】 
- **Manual Editing** – Every node supports rename-on-double-click, manual children, collapsible outlines, and sticky notes for annotations.【F:src/components/Node.js†L23-L183】 
- **UI Composition** – Header exposes auth controls, Sidebar lists maps and provides the “New Map” launcher, and the main canvas hosts button bar actions and the tree editor.【F:src/components/Header.js†L5-L32】【F:src/components/Sidebar.js†L6-L70】【F:src/App.js†L250-L355】 
- **Infrastructure** – The project relies on Firebase (Auth, Firestore, Storage) and OpenAI credentials stored in localStorage or `.env`, plus Vercel Analytics injection for usage tracking.【F:src/firebase.js†L1-L33】【F:src/App.js†L22-L35】【F:src/App.js†L15-L19】

## 3. Goals & Success Metrics
1. **Fast ideation** – Reduce time-to-first-branch after login to under one minute; track via wizard completion events and child node generation counts.  
2. **Sustained engagement** – Achieve at least three manual edits (renames, notes, or manual nodes) per session; measure via mind map update frequency in Firestore.  
3. **Donation-friendly flow** – Surface non-intrusive donation prompts after high-value actions (exports, repeated AI generations) and aim for a 5% click-through rate.【F:src/App.js†L140-L178】【F:src/components/DonationDialog.js†L4-L55】【F:src/components/DonationPanel.js†L4-L45】

## 4. Target User Journeys
1. **New creator with API key** – Signs up, enters OpenAI key when first generating subtopics, and completes an AI-assisted map draft.【F:src/App.js†L71-L355】【F:src/components/ApiKeyDialog.js†L3-L35】  
2. **Returning planner refining a map** – Logs in, selects an existing map from the sidebar, edits titles, adds manual nodes, and attaches sticky notes to capture research.【F:src/components/Sidebar.js†L24-L58】【F:src/components/Node.js†L73-L183】  
3. **Collaborator exporting and importing** – Downloads a JSON snapshot, shares externally, and re-imports to continue editing, triggering donation reminders along the way.【F:src/App.js†L165-L198】  
4. **Casual user exploring without auth** – Attempts to generate or import content, is guided to the auth forms, and can preview the value proposition from the landing layout.【F:src/App.js†L71-L263】

## 5. Product Requests & Backlog for Vibe Coding Agents
### A. Guided AI Setup & Feedback Loop
- **Problem**: Users may not realize why generation is blocked without an API key, and errors surface only as alerts.【F:src/components/MindMap.js†L32-L107】  
- **Request**: Implement a reusable inline banner that explains the API key requirement, persists key status, and surfaces GPT error messages in-context with retry controls.  
- **Acceptance**: Banner appears on the mind map canvas until a valid key exists, retries reuse stored context, and success removes the warning automatically.

### B. Persistent Notes & Manual Edits
- **Problem**: Node note additions mutate local state but rely on parent refresh to sync; there is no explicit save feedback or undo.【F:src/components/Node.js†L34-L155】【F:src/components/MindMap.js†L109-L213】  
- **Request**: Add explicit persistence hooks (auto-save toast or manual save button), implement undo for the last note/node action, and ensure Firestore updates batch related changes.  
- **Acceptance**: Manual edits trigger visible confirmation, Firestore documents stay consistent, and undo restores previous node state within the session.

### C. Wizard Outcome Customization
- **Problem**: The wizard always generates uniform tree depth and count, lacking templates or preview to adjust before committing.【F:src/App.js†L95-L147】【F:src/components/WizardDialog.js†L3-L190】  
- **Request**: Extend the wizard with template presets (e.g., SWOT, project plan), allow toggling AI vs. manual start, and display a summary preview before creation.  
- **Acceptance**: Users can pick a template that adjusts prompt parameters, preview the resulting structure, and either confirm or return to edit choices.

### D. Library Management & Collaboration
- **Problem**: Map ownership is single-user with no sharing or categorization, and the sidebar can become crowded.【F:src/App.js†L149-L355】【F:src/components/Sidebar.js†L24-L70】  
- **Request**: Introduce tagging/folder support in the sidebar, enable optional read-only sharing links, and provide map-level metadata (last edited, collaborators).  
- **Acceptance**: Sidebar groups maps by tag, share links honor read-only mode, and metadata surfaces in the list and export payloads.

## 6. Technical Notes for Implementation
- **Data Model**: Mind maps store `title`, `userId`, root-level `children`, and `notes` arrays; child nodes include recursive `children` and `notes`, each with random IDs for client-generated uniqueness.【F:src/App.js†L103-L138】【F:src/components/MindMap.js†L21-L123】  
- **External Services**: Firebase Auth guards map access; Firestore backs CRUD operations; OpenAI GPT-4 produces subtopics with prompts that exclude duplicates; Vercel analytics is initialized globally.【F:src/App.js†L35-L178】【F:src/api/chatgpt.js†L1-L42】【F:src/App.js†L15-L19】【F:src/firebase.js†L1-L33】  
- **State Handling**: React hooks orchestrate loading spinners, modal dialogs, and pending actions (e.g., store node waiting for API key). Ensure new features respect these patterns to avoid race conditions.【F:src/App.js†L22-L357】【F:src/components/MindMap.js†L15-L213】

## 7. Analytics & Success Metrics Hooks
- Instrument wizard steps, AI generation attempts, manual add/edit/delete events, export/import actions, and donation interactions for funnels.  
- Surface analytics via Vercel or alternative pipeline while respecting user privacy and Firebase security rules.【F:src/App.js†L15-L19】【F:src/App.js†L140-L198】

## 8. Open Questions
1. Should anonymous users get a limited sandbox map without auth for trial?  
2. Is there a roadmap for collaborative editing (multi-user real-time)?  
3. What compliance considerations (e.g., GDPR) apply to storing user-generated content and API keys? 
4. Do we need rate limits or budget controls for OpenAI usage per account?

---
This document should equip vibe coding agents with a clear understanding of today’s experience and the prioritized enhancements needed to level up Mind Trix.
