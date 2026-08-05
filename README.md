# ACS Hub App

A UI/UX prototype for AC Customisation's 30-day design tracking workflow: Dashboard, Designs list, Design detail with a progress-update flow, Weekly Review, and Best Practice screens.

Built with React, Vite, Tailwind CSS, React Router, Recharts, and lucide-react. All data is mocked client-side (see `src/data/designs.js`) — there is no backend yet.

## Getting started

```bash
npm install
npm run dev
```

## Structure

- `src/pages` – one file per screen (Dashboard, Designs, DesignDetail, Reports, BestPractice)
- `src/components` – shared UI (Sidebar, StatCard, StatusPill, UpdateProgressModal)
- `src/data/designs.js` – mock dataset and status helpers
- `src/state/DesignsContext.jsx` – in-memory state so progress updates reflect across pages
