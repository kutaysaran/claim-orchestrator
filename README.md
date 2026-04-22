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

- Live URL: [https://claim-orchestrator-kod7.vercel.app/](https://claim-orchestrator-kod7.vercel.app/)

## Design decisions

- The UI is mobile-first and prioritizes information hierarchy: file number, current stage, remaining time, and required action are surfaced before the detailed timeline.
- The layout expands into a two-column desktop view so the summary stays readable while the action panel and document analyzer remain visible during longer timeline scans.
- React Query handles server data, while Zustand is limited to local interactive state. This keeps fetched claim data separate from mutable client-side actions such as inserted nodes, AI explanations, and analyzer results.
- Zod validates the API payload before the dashboard renders, so the UI only consumes known-safe claim shapes.
- Timeline rendering uses a registry pattern so heterogeneous `processDetails` entries can map to dedicated node components without large `if/else` branches, making new step types easier to add.
- Added notes and attachments are intentionally lightweight and inline-editable to keep the claimant workflow fast and local-first during the MVP.
- The AI features are deliberately simulated for the case study: "Explain with AI" focuses on contextual plain-language summaries, and the document analyzer focuses on pre-submission blocker-document validation rather than fake backend complexity.

## Time-box trade-offs

- The claim API is mocked through a local Next.js route.
- AI outputs are simulated rather than connected to a real model or OCR/document pipeline.
- Document analysis checks file size, type/extension, and filename heuristics instead of actual file contents.
- Inserted nodes and analyzer state are persisted locally, not to a backend.

## Document Analyzer Note

- Accepted file types: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp`
- Maximum file size: `5 MB`
- For the simulated `Occupational Certificate` validation, the filename should clearly include both `occupational` and `certificate`
- Recommended example filename: `occupational-certificate.pdf`
- This is a simulated validation flow based on file name, type/extension, and size. It does not inspect the actual file contents.

## What I would improve with more time

- Persist inserted notes, attachments, and analyzer outcomes to a backend.
- Replace simulated document analysis with real file-content validation and richer confidence states.
- Add a one-click flow to attach a successfully validated document directly into the timeline.
- Expand automated coverage with end-to-end tests for the main claimant journey, especially note insertion, attachment flows, and AI explanation interactions.
- Continue improving accessibility with a dedicated keyboard/screen-reader audit and contrast review.
- Reduce remaining process-node repetition by centralizing more field configuration metadata.
- Add analytics/instrumentation to learn where claimants hesitate most in the flow.
- Improve resilience with richer retry/error recovery states and clearer fallback guidance.

## AI tools used

- Cursor agent for implementation support, architecture iteration, and code generation/refinement.
