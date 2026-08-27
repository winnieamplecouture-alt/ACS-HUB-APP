// Per-category timeline templates: each design's checklist is generated
// from one of these based on its category, unless it's flagged urgent, in
// which case the urgent template always wins. Durations are editable in
// Settings — these are just the starting defaults.

export const DEFAULT_TIMELINE_TEMPLATES = {
  rtw: {
    label: "Ready-to-Wear",
    hint: "Standard timeline: 35–48 days",
    stages: [
      { key: "consultation", label: "Consultation", days: 4 },
      { key: "sketch", label: "Sketch Development", days: 10 },
      { key: "production", label: "Production", days: 19 },
      { key: "hybrid", label: "Hybrid Processing", days: 7 },
    ],
  },
  couture: {
    label: "Couture / High End",
    hint: "Longer production window",
    stages: [
      { key: "consultation", label: "Consultation", days: 5 },
      { key: "sketch", label: "Sketch Development", days: 14 },
      { key: "production", label: "Production", days: 35 },
      { key: "hybrid", label: "Hybrid Processing", days: 10 },
    ],
  },
  urgent: {
    label: "Urgent",
    hint: "Rush timeline — overrides RTW/Couture when a design is marked urgent",
    stages: [
      { key: "consultation", label: "Consultation", days: 1 },
      { key: "sketch", label: "Sketch Development", days: 3 },
      { key: "production", label: "Production", days: 10 },
      { key: "hybrid", label: "Hybrid Processing", days: 3 },
    ],
  },
};

export function totalDays(stages) {
  return stages.reduce((sum, s) => sum + (Number(s.days) || 0), 0);
}

// Each stage's own day-length, carried through as-is — due dates get
// calculated later from when the previous stage actually finished, not
// from a fixed schedule computed once up front.
export function stagesToMilestones(stages) {
  return stages.map((s) => ({ label: s.label, days: Number(s.days) || 0 }));
}

export function templateKeyForDesign(design) {
  if (design.urgent) return "urgent";
  if (!design.category || design.category === "RTW") return "rtw";
  return "couture";
}
