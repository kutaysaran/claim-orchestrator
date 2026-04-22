# AI-Powered Claim Orchestrator

Time-boxed frontend MVP for the technical case study. The dashboard prioritizes the three core user questions first: current claim status, remaining time, and whether the claimant needs to take action right now.

## Stack

- Next.js + React + TypeScript
- TanStack React Query
- Zustand
- Zod
- Tailwind CSS
- Local `components/ui` primitives in the shadcn/ui style

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Deployment

- Live URL: [claim-orchestrator-eight.vercel.app](https://claim-orchestrator-eight.vercel.app/)

## Design decisions

- The UI is mobile-first and expands into a two-column desktop layout so the summary stays readable while the action panel and document analyzer remain visible.
- React Query fetches `/api/claim` and keeps server data separate from local interactive state.
- Zod validates the API payload before the dashboard renders any claim data.
- Zustand stores only mutable client-side state such as inserted timeline nodes, AI explanations, and document analyzer results.
- Timeline rendering uses a registry pattern so heterogeneous `processDetails` entries can map to dedicated node components without large `if/else` branches.
- Added notes and attachments are intentionally lightweight: users can insert them between steps, edit them inline, and remove them without leaving the flow.
- The AI features are deliberately simulated for the case study: "Explain with AI" generates contextual plain-language summaries, and the document analyzer performs heuristic validation for the required blocker document.

## Time-box trade-offs

- The claim API is mocked through a local Next.js route.
- AI outputs are simulated rather than connected to a real model or OCR/document pipeline.
- Document analysis checks file size, type/extension, and filename heuristics instead of actual file contents.
- Inserted nodes and analyzer state are persisted locally, not to a backend.

## What I would improve with more time

- Persist inserted notes, attachments, and analyzer outcomes to a backend.
- Replace simulated document analysis with real file-content validation and richer confidence states.
- Add end-to-end coverage for the main claimant journey, especially note insertion, attachment flows, and AI explanation interactions.
- Continue improving accessibility with a dedicated keyboard/screen-reader audit and contrast review.
- Reduce remaining process-node repetition by centralizing more field configuration metadata.

## AI tools used

- Cursor agent for implementation support, architecture iteration, and code generation/refinement.
