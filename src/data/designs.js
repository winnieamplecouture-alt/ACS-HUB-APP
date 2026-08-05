// Mock data for the AC Customisation Hub prototype.
// Milestone sequence used to build each design's 30-day timeline.
export const MILESTONE_TEMPLATE = [
  { day: 1, label: "Order Confirmed & Payment" },
  { day: 3, label: "Measurements Confirmed" },
  { day: 6, label: "Fabric Confirmed & Ordered" },
  { day: 10, label: "Pattern Completed" },
  { day: 15, label: "First Sample Completed" },
  { day: 18, label: "Sample Fitting Completed" },
  { day: 21, label: "Production Started" },
  { day: 26, label: "QC Completed" },
  { day: 30, label: "Delivered to Customer" },
];

export const STATUS = {
  ON_TRACK: "On Track",
  AT_RISK: "At Risk",
  BEHIND: "Behind",
  COMPLETED: "Completed",
};

export const STATUS_STYLES = {
  [STATUS.ON_TRACK]: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", chart: "#22c55e" },
  [STATUS.AT_RISK]: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", chart: "#f59e0b" },
  [STATUS.BEHIND]: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", chart: "#ef4444" },
  [STATUS.COMPLETED]: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", chart: "#3b82f6" },
};

const PICS = ["Tammy", "Winnie", "Factory"];

function nextMilestoneFor(day, status) {
  if (status === STATUS.COMPLETED) return { label: "Delivered to Customer", day: 30 };
  const upcoming = MILESTONE_TEMPLATE.find((m) => m.day >= day) ?? MILESTONE_TEMPLATE[MILESTONE_TEMPLATE.length - 1];
  return { label: upcoming.label, day: upcoming.day };
}

function buildTimeline(day, status, id) {
  // Deterministic small per-design offset so actual dates aren't perfectly on target.
  const seed = parseInt(id.replace("A", ""), 10);
  const baseDate = new Date(2025, 7, 5); // 5 Aug 2025 = Day 1
  return MILESTONE_TEMPLATE.map((m, idx) => {
    const target = new Date(baseDate);
    target.setDate(target.getDate() + (m.day - 1));
    const isDone =
      status === STATUS.COMPLETED
        ? true
        : m.day < day || (m.day === day && status !== STATUS.BEHIND);
    const drift = ((seed + idx) % 5) - 2; // -2..2 day drift for actuals
    const actual = new Date(target);
    actual.setDate(actual.getDate() + (isDone ? Math.max(-1, Math.min(2, drift)) : 0));
    return {
      day: m.day,
      milestone: m.label,
      targetDate: target,
      actualDate: isDone ? actual : null,
    };
  });
}

const RAW = [
  { id: "A001", customer: "Sarah", day: 8, status: STATUS.ON_TRACK, pic: "Tammy", phone: "012-3456789" },
  { id: "A002", customer: "Mei", day: 13, status: STATUS.BEHIND, pic: "Winnie", phone: "013-2214477", behindDays: 4, reason: "Fabric Delay" },
  { id: "A003", customer: "Kelly", day: 5, status: STATUS.AT_RISK, pic: "Winnie", phone: "016-8845221" },
  { id: "A004", customer: "Amy", day: 9, status: STATUS.ON_TRACK, pic: "Tammy", phone: "019-5563321" },
  { id: "A005", customer: "Jess", day: 17, status: STATUS.BEHIND, pic: "Factory", phone: "011-2298765", behindDays: 2, reason: "Fitting Delay" },
  { id: "A006", customer: "Cindy", day: 6, status: STATUS.ON_TRACK, pic: "Tammy", phone: "017-7743210" },
  { id: "A007", customer: "Yvonne", day: 3, status: STATUS.ON_TRACK, pic: "Winnie", phone: "014-9982211" },
  { id: "A008", customer: "Hannah", day: 11, status: STATUS.ON_TRACK, pic: "Tammy", phone: "018-2231144" },
  { id: "A009", customer: "Lily", day: 11, status: STATUS.BEHIND, pic: "Winnie", phone: "012-6654332", behindDays: 1, reason: "Customer Delay" },
];

const MORE_NAMES = [
  "Grace", "Nadia", "Wei Ling", "Priya", "Farah", "Bella", "Siti", "Ivy", "Rachel", "Amanda",
  "Sofia", "Joanne", "Michelle", "Denise", "Karen", "Alicia", "Vivian", "Natalie", "Chloe", "Diana",
  "Zara", "Elaine", "Ruby", "Melissa", "Tanya", "Fiona", "Wendy", "Olivia", "Pearl", "Serena",
  "Aisyah", "Christine", "Angela",
];

const COMPLETED_NOTES = [
  "Customer replied fast",
  "Measurements clear",
  "Fabric ready in stock",
  "Factory slot available",
];

function generateMore() {
  const extra = [];
  // target distribution across the *full* dataset (RAW already has 4 on-track, 1 at-risk, 3 behind, 0 completed)
  const need = { [STATUS.ON_TRACK]: 13, [STATUS.AT_RISK]: 6, [STATUS.BEHIND]: 2, [STATUS.COMPLETED]: 12 };
  let nameIdx = 0;
  let num = 10;
  const order = [
    ...Array(need[STATUS.COMPLETED]).fill(STATUS.COMPLETED),
    ...Array(need[STATUS.ON_TRACK]).fill(STATUS.ON_TRACK),
    ...Array(need[STATUS.AT_RISK]).fill(STATUS.AT_RISK),
    ...Array(need[STATUS.BEHIND]).fill(STATUS.BEHIND),
  ];
  for (const status of order) {
    const id = `A${String(num).padStart(3, "0")}`;
    const customer = MORE_NAMES[nameIdx % MORE_NAMES.length];
    nameIdx++;
    const pic = PICS[num % PICS.length];
    let day;
    if (status === STATUS.COMPLETED) day = 30;
    else if (status === STATUS.ON_TRACK) day = 2 + (num % 24);
    else if (status === STATUS.AT_RISK) day = 4 + (num % 18);
    else day = 6 + (num % 20);
    const entry = { id, customer, day, status, pic, phone: `01${(num % 9) + 1}-${1000000 + num * 37}` };
    if (status === STATUS.BEHIND) {
      entry.behindDays = 1 + (num % 3);
      entry.reason = ["Fabric Delay", "Fitting Delay", "Customer Delay", "Machine Breakdown"][num % 4];
    }
    if (status === STATUS.COMPLETED) {
      const daysTaken = 22 + (num % 6);
      entry.completedInDays = daysTaken;
      entry.aheadDays = 30 - daysTaken;
      entry.completedDate = "Aug 2025";
    }
    extra.push(entry);
    num++;
  }
  return extra;
}

const ALL_RAW = [...RAW, ...generateMore()];

export const DESIGNS = ALL_RAW.map((d) => {
  const next = nextMilestoneFor(d.day, d.status);
  return {
    ...d,
    nextMilestone: next.label,
    nextMilestoneDay: next.day,
    orderDate: "5 Aug 2025",
    targetDelivery: "3 Sep 2025 (30 days)",
    timeline: buildTimeline(d.day, d.status, d.id),
    notes: "",
  };
});

export const BEST_PRACTICE = {
  id: "A004",
  customer: DESIGNS.find((d) => d.id === "A004")?.customer ?? "Amy",
  completedInDays: 24,
  aheadDays: 6,
  date: "8 Aug 2025",
  pic: "Tammy",
  reasons: COMPLETED_NOTES,
};

export function statusCounts(designs = DESIGNS) {
  return {
    onTrack: designs.filter((d) => d.status === STATUS.ON_TRACK).length,
    atRisk: designs.filter((d) => d.status === STATUS.AT_RISK).length,
    behind: designs.filter((d) => d.status === STATUS.BEHIND).length,
    completed: designs.filter((d) => d.status === STATUS.COMPLETED).length,
    total: designs.length,
  };
}

export function needAttention(designs = DESIGNS) {
  return designs
    .filter((d) => d.status === STATUS.BEHIND)
    .sort((a, b) => (b.behindDays ?? 0) - (a.behindDays ?? 0));
}
