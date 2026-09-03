// Per-category timeline templates: each design's checklist is generated
// from one of these based on its category, unless it's flagged urgent, in
// which case the urgent template always wins. Durations are editable in
// Settings — these are just the starting defaults.

// The standard stage list every design's timeline is built from, in order.
// Same stages for all three categories — only each stage's day-length
// differs per category (and is fully editable in Settings).
export const STANDARD_STAGES = [
  { key: "paid", label: "Paid" },
  { key: "consultation", label: "Consultation" },
  { key: "sketch", label: "Sketch Development" },
  { key: "technical_sketch", label: "Technical Sketch" },
  { key: "fabric_sourcing_confirmation", label: "Fabric Sourcing Confirmation" },
  { key: "fabric_sourcing", label: "Fabric Sourcing" },
  { key: "fabric_sourcing_confirm", label: "Fabric Sourcing Confirm" },
  { key: "quotation_review", label: "Quotation Review" },
  { key: "quotation_confirmed", label: "Quotation Confirmed" },
  { key: "fabric_arrive", label: "Fabric Arrive" },
  { key: "production_team", label: "Production Team" },
  { key: "quality_check", label: "Quality Check" },
  { key: "fitting", label: "Fitting" },
  { key: "minor_alteration", label: "Minor Alteration" },
  { key: "completed", label: "Completed" },
];

function withDefaultDays(days) {
  return STANDARD_STAGES.map((s, i) => ({ ...s, days: days[i] }));
}

export const DEFAULT_TIMELINE_TEMPLATES = {
  rtw: {
    label: "Ready-to-Wear",
    hint: "Standard timeline: 35–48 days",
    stages: withDefaultDays([1, 3, 5, 3, 2, 5, 2, 2, 2, 5, 10, 1, 2, 3, 1]),
  },
  couture: {
    label: "Couture / High End",
    hint: "Longer production window",
    stages: withDefaultDays([1, 5, 10, 5, 3, 10, 3, 3, 3, 7, 20, 2, 4, 5, 1]),
  },
  urgent: {
    label: "Urgent",
    hint: "Rush timeline — overrides RTW/Couture when a design is marked urgent",
    stages: withDefaultDays([1, 1, 2, 1, 1, 3, 1, 1, 1, 2, 4, 1, 1, 1, 1]),
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
