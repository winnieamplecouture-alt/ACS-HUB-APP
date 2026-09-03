// Real design records from the ACS Customization Design Record tracker
// (Google Sheet, "AR" + "P" tabs, provided by the user 2026-08-06): 44
// designs (CDS1.1-CDS1.44) across 11 customers, with their real category
// and current pre-production remark. None have reached CLO3D/Deposit/
// Production in that tracker yet, so every design starts "Not Started"
// here too — the 30-day clock below is this app's own, separate from the
// tracker's granular D.S/F.S/Quotation/Deposit/CLO3D checkpoints.
//
// V1 scope (per the user's product spec, 2026-08-06): one purpose — help
// the team see which designs are on track, at risk, or behind, and what
// action is needed. Each garment ("design") runs the same fixed 30-day,
// 9-milestone checklist. Ticking a box records today's date. Status
// (on track / at risk / behind) is derived automatically from today's
// date vs. the next unticked milestone's target date — nothing is typed
// unless a design falls behind, and then only four short fields.

export const DESIGN_MILESTONES = [
  { days: 1, label: "Order Confirmed" },
  { days: 2, label: "Measurement Done" },
  { days: 3, label: "Fabric Ordered" },
  { days: 4, label: "Pattern Complete" },
  { days: 5, label: "First Sample" },
  { days: 3, label: "Fitting" },
  { days: 3, label: "Production" },
  { days: 5, label: "QC" },
  { days: 4, label: "Delivered" },
];

export const DELAY_REASONS = ["Customer", "Supplier", "Factory", "Internal", "Other"];

// What a best-practice note is actually attributing performance to — picked
// every time a step is ticked done (on time or overdue), so Reports can
// show what's driving good performance, not just what's causing delays.
export const NOTE_CATEGORIES = [
  "Customer Responsiveness",
  "Fabric & Material Sourcing",
  "Team Capacity",
  "Design Complexity",
  "Planning & Scheduling",
  "Communication",
  "Supplier / Vendor",
  "Other",
];

export const CATEGORIES = ["RTW", "High End", "Couture"];

export const PACKAGE_OPTIONS = ["500", "1000", "3000", "5000"];

// Each customer's Canva design deck (view-only presentation of all her
// sketches) and Excel technical sketch (fabric + sewing details), provided
// 2026-09-03. Keyed by customer name as it appears on her designs; a couple
// of customers have two name spellings/variants in use, so both are listed
// pointing at the same link. These get applied automatically to every
// design of that customer that doesn't already have its own link set — see
// applyKnownLinks in DesignsContext.jsx.
export const DESIGN_DECK_LINKS_BY_CUSTOMER = {
  "Lau Yoke Foong": "https://canva.link/bwikambinlaaw3e",
  "Ngaw Yin Yin": "https://www.canva.com/design/DAHMtWuUrc4/Xy6kxmNYlqrNqz6U3niY9A/edit",
  "Eileen Chong": "https://canva.link/0wkhpenh3ts5bx4",
  "Eileen Choong": "https://canva.link/0wkhpenh3ts5bx4",
  "Jacqueline Lim Sweet Chuen": "https://www.canva.com/design/DAHMPbbcl9E/DOMNPMDJO9W_0rfF0c8PAQ/edit",
  "Chrissie Mulyani Tamara": "https://www.canva.com/design/DAHMtS1HBqo/BsmPf-VYSkUc-Hq5BRicWg/edit",
  "Gigi Lee Daphne Tai": "https://canva.link/nypz0m4h4gteuwf",
  "Gigi Lee": "https://canva.link/nypz0m4h4gteuwf",
  Daisy: "https://canva.link/41p0flmym1sz51m",
  Triny: "https://canva.link/48b2nuot4gzivid",
  MS: "https://www.canva.com/design/DAHMtVtxTSU/yznEnwRXYd7mf4CnzSf2PA/edit",
  Cheryl: "https://canva.link/pyt7fdukgylqphm",
};

export const TECHNICAL_SKETCH_LINKS_BY_CUSTOMER = {
  "Lau Yoke Foong": "https://docs.google.com/spreadsheets/d/1hiDAneOYCQVI_A3LgzdFi4m_TUQeYp4_mR_U-gBGIgA/edit?usp=sharing",
  "Ngaw Yin Yin": "https://docs.google.com/spreadsheets/d/1DmeJFK0eXOJrTbrA2k3IfIXMxD9k4G7CYkDWaeRZrKA/edit?usp=sharing",
  "Eileen Chong": "https://docs.google.com/spreadsheets/d/1BJRGoqQ2rkkkT1Pd7BfHrVpsA9JI9BtgXbw6jVea24E/edit?usp=sharing",
  "Eileen Choong": "https://docs.google.com/spreadsheets/d/1BJRGoqQ2rkkkT1Pd7BfHrVpsA9JI9BtgXbw6jVea24E/edit?usp=sharing",
  "Jacqueline Lim Sweet Chuen": "https://docs.google.com/spreadsheets/d/16KUuCPNDzVHzwqW6VUCpfJkF5QTSvKGKwhJTeCcRDP4/edit?usp=sharing",
  "Chrissie Mulyani Tamara": "https://docs.google.com/spreadsheets/d/1sgOLiLYk-A2feElj9cPSQ1G5sm0bWCVsT2Je5tXQjeI/edit?usp=sharing",
  "Gigi Lee Daphne Tai": "https://docs.google.com/spreadsheets/d/12sF0qQtVFEss7mgBveho__5LxrvHNcl-BsbInTr2PhQ/edit?usp=sharing",
  "Gigi Lee": "https://docs.google.com/spreadsheets/d/12sF0qQtVFEss7mgBveho__5LxrvHNcl-BsbInTr2PhQ/edit?usp=sharing",
  Daisy: "https://docs.google.com/spreadsheets/d/1ZH-AH8dpYPPB-mHnANQxu9BDjzWiFkLNu0CM5yRlW10/edit?usp=sharing",
  Triny: "https://docs.google.com/spreadsheets/d/1plHSWenUl-qLtYnCYVICiz8FZLUvjDtoe_pcad8deVI/edit?usp=sharing",
  MS: "https://docs.google.com/spreadsheets/d/1o3gcTYn7Jxt8x_wSp934bN-xnsNy40XtTSnMan7vs78/edit?usp=sharing",
  Cheryl: "https://docs.google.com/spreadsheets/d/1ijqLSx_QyzXCPq3tN4IfEWHIitmNCG3OUmnRnMWtGOM/edit?usp=sharing",
};

export const BASE_DESIGNS = [
  { id: "CDS1.1", photo: "/design-photos/CDS1.1.jpg", name: "Butterfly Gown 2-Piece Set (Top+Skirt)", customer: "Lau Yoke Foong", pic: "Winnie", category: "High End", remark: "Fabric sourcing china (order china)", timeline: null },
  { id: "CDS1.2", photo: "/design-photos/CDS1.2.jpg", name: "Elegant Halter 2-Piece Set (Top+Pants)", customer: "Lau Yoke Foong", pic: "Winnie", category: "RTW", remark: "Fabric sourcing", timeline: null },
  { id: "CDS1.3", photo: "/design-photos/CDS1.3.jpg", name: "Blazer Dress 2-Piece Set (Dress + Short Pants)", customer: "Lau Yoke Foong", pic: "Winnie", category: "RTW", remark: "Can start fabric sourcing (RM13 per meter)", timeline: null },
  { id: "CDS1.4", photo: "/design-photos/CDS1.4.jpg", name: "Blazer Set with Kimono Belt 3-Piece Set (Top+Skirt+Belt)", customer: "Lau Yoke Foong", pic: "Winnie", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.5", photo: "/design-photos/CDS1.5.jpg", name: "Sleeveless Lace Maxi Dress", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.6", photo: "/design-photos/CDS1.6.jpg", name: "Batik Lace Set 2-Piece Set (Top+Skirt)", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.7", photo: "/design-photos/CDS1.7.jpg", name: "Denim Halter Top & Asymmetrical Skort (Top+Skort)", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.8", photo: "/design-photos/CDS1.8.jpg", name: "Pink Couture 2-Piece Set (Top + Skirt)", customer: "Eileen Choong", pic: "Winnie", category: "Couture", remark: "Can start fabric sourcing — patchwork local (RM35), china (7-8 days), border lace (1m 13rm)", timeline: null },
  { id: "CDS1.9", photo: "/design-photos/CDS1.9.jpg", name: "Denim Lace Top", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.10", photo: "/design-photos/CDS1.10.jpg", name: "Elegant Casual Jumpsuit + Braided Belt", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.11", photo: "/design-photos/CDS1.11.jpg", name: "Business Casual Set 2-Piece Set (Top+Shorts)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "Can start fabric sourcing", timeline: null },
  { id: "CDS1.12", photo: "/design-photos/CDS1.12.jpg", name: "Brocade Short Dress", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.13", photo: "/design-photos/CDS1.13.jpg", name: "Halter Lace 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "Pending customer confirmation & waiting for production team to update", timeline: null },
  { id: "CDS1.14", photo: "/design-photos/CDS1.14.jpg", name: "Barbie Doll Lace Dress", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.15", photo: "/design-photos/CDS1.15.jpg", name: "Lace 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.16", photo: "/design-photos/CDS1.16.jpg", name: "Denim Gradient 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.17", photo: "/design-photos/CDS1.17.jpg", name: "Kebaya Set", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "On hold", timeline: null },
  { id: "CDS1.18", photo: "/design-photos/CDS1.18.jpg", name: "Feminine Casual Set / Dress", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "Pending customer confirmation & waiting for production team to update", timeline: null },
  { id: "CDS1.19", photo: "/design-photos/CDS1.19.jpg", name: "Embroidered 2-Piece Set (Top + Skirt)", customer: "Ngaw Yin Yin", pic: null, category: "Couture", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.20", photo: "/design-photos/CDS1.20.jpg", name: "CNY 3-Piece Set (Top + Shorts + Long Skirt)", customer: "Ngaw Yin Yin", pic: null, category: "", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.21", photo: "/design-photos/CDS1.21.jpg", name: "Minimal Batik Top", customer: "Ngaw Yin Yin", pic: null, category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.22", photo: "/design-photos/CDS1.22.jpg", name: "Formal Men's Shirt", customer: "Jacqueline Lim Sweet Chuen", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.23", photo: "/design-photos/CDS1.23.jpg", name: "Denim Dress", customer: "Jacqueline Lim Sweet Chuen", pic: "Winnie", category: "RTW", remark: "Sketch development in progress", timeline: null },
  { id: "CDS1.24", photo: "/design-photos/CDS1.24.jpg", name: "Casual Women's Shirt (long sleeve)", customer: "Jacqueline Lim Sweet Chuen", pic: "Winnie", category: "RTW", remark: "Sketch development in progress", timeline: null },
  { id: "CDS1.25", photo: "/design-photos/CDS1.25.jpg", name: "Casual Women's Shirt (short sleeve)", customer: "Jacqueline Lim Sweet Chuen", pic: "Winnie", category: "RTW", remark: "Sketch development in progress", timeline: null },
  { id: "CDS1.26", photo: "/design-photos/CDS1.26.jpg", name: "Lace Long Dress", customer: "Jacqueline Lim Sweet Chuen", pic: "Winnie", category: "RTW", remark: "Sketch development in progress", timeline: null },
  { id: "CDS1.27", photo: "/design-photos/CDS1.27.jpg", name: "Black Lace Dress", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.28", photo: "/design-photos/CDS1.28.jpg", name: "Kebaya 2-Piece Set (Top + Skirt)", customer: "Daisy", pic: "Winnie", category: "Couture", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.29", photo: "/design-photos/CDS1.29.jpg", name: "AC234 Jumpsuit", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.30", photo: "/design-photos/CDS1.30.jpg", name: "Pants", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.31", photo: "/design-photos/CDS1.31.jpg", name: "Blazer & Dress", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.32", photo: "/design-photos/CDS1.32.jpg", name: "Lace Blazer Set (Blazer + Trouser)", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.33", photo: "/design-photos/CDS1.33.jpg", name: "Blue Elegant Set (Top + Skirt)", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.34", photo: "/design-photos/CDS1.34.jpg", name: "Yellow Flowy Dress", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.35", photo: "/design-photos/CDS1.35.jpg", name: "Jumpsuit", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.36", photo: "/design-photos/CDS1.36.jpg", name: "Husband & Son Matching Top", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.37", photo: "/design-photos/CDS1.37.jpg", name: "Cargo Pants", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.38", photo: "/design-photos/CDS1.38.jpg", name: "Lace Skirt", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.39", photo: "/design-photos/CDS1.39.jpg", name: "Pilates Outerwear", customer: "Cheryl", pic: null, category: "RTW", remark: "Sketch in progress", timeline: null },
  { id: "CDS1.40", photo: "/design-photos/CDS1.40.jpg", name: "Duo Colour Pants", customer: "Daisy", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.41", photo: "/design-photos/CDS1.41.jpg", name: "Red Jumpsuit", customer: "Triny", pic: "Jocelyn", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.42", photo: "/design-photos/CDS1.42.jpg", name: "Denim Lace 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.43", photo: "/design-photos/CDS1.43.jpg", name: "Beige CNY 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
  { id: "CDS1.44", photo: "/design-photos/CDS1.44.jpg", name: "CNY Purple 2-Piece Set (Top + Skirt)", customer: "Gigi Lee", pic: "Winnie", category: "RTW", remark: "WIP technical sketch + confirm fabric type", timeline: null },
];

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(date, n) {
  const x = new Date(date);
  x.setDate(x.getDate() + n);
  return x;
}

export function startDesignTimeline(startDate = new Date(), milestoneDefs = DESIGN_MILESTONES) {
  const start = startOfDay(startDate);
  return {
    startDate: start,
    milestones: milestoneDefs.map((m) => ({ label: m.label, days: m.days, done: false, completedDate: null, note: null })),
    delay: null,
    // Already built from the current standard stage list — the one-time
    // migration in DesignsContext should never touch this timeline again.
    standardized: true,
  };
}

// Each milestone's due date is calculated from when the PREVIOUS one was
// actually completed (or the timeline's start date, for the first one) plus
// that stage's configured number of days — not from the original start date
// alone. So marking a step done late pushes every date after it out too,
// and marking it done early can pull the rest forward.
export function withTargetDates(design) {
  if (!design.timeline) return [];
  let anchor = design.timeline.startDate;
  return design.timeline.milestones.map((m) => {
    const targetDate = addDays(anchor, m.days);
    anchor = m.done && m.completedDate ? m.completedDate : targetDate;
    return { ...m, targetDate };
  });
}

export function totalTimelineDays(design) {
  if (!design.timeline) return 0;
  return design.timeline.milestones.reduce((sum, m) => sum + m.days, 0);
}

// Automatic status: on_track / at_risk / behind / completed / not_started.
// "Behind" = today's date is past the next unticked milestone's due date.
export function designStatus(design, today = new Date()) {
  if (!design.timeline) return { key: "not_started", label: "Not Started", emoji: "⚪" };

  const t = startOfDay(today).getTime();
  const currentDay = Math.floor((t - design.timeline.startDate) / 86400000) + 1;
  const next = withTargetDates(design).find((m) => !m.done);

  if (!next) return { key: "completed", label: "Completed", emoji: "✅", currentDay };

  const dueDay = startOfDay(next.targetDate).getTime();
  let key;
  if (t < dueDay) key = "on_track";
  else if (t === dueDay) key = "at_risk";
  else key = "behind";

  const labels = { on_track: "On Track", at_risk: "At Risk", behind: "Behind" };
  const emojis = { on_track: "🟢", at_risk: "🟡", behind: "🔴" };
  return { key, label: labels[key], emoji: emojis[key], currentDay, nextMilestone: next };
}

export function expectedVsActual(design, today = new Date()) {
  if (!design.timeline) return { expected: null, next: null };
  const milestones = withTargetDates(design);
  const t = startOfDay(today).getTime();
  // Expected = the last milestone whose due date has arrived; if it's done,
  // "expected" naturally advances to whichever one is still pending.
  const dueOrOverdue = milestones.filter((m) => startOfDay(m.targetDate).getTime() <= t);
  const expected = dueOrOverdue.at(-1) ?? null;
  const next = milestones.find((m) => !m.done) ?? null;
  return { expected, next };
}

export const STATUS_STYLES = {
  not_started: { text: "text-gray-500", bg: "bg-gray-50", border: "border-gray-200" },
  on_track: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  at_risk: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  behind: { text: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  completed: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};
