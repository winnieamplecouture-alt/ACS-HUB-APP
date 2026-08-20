// Real customer data transcribed from the ACS Customization tracker
// (Google Sheet, "ACS Customization" tab, provided by the user 2026-08-06).
//
// V1 scope (per the user's product spec, 2026-08-06): one purpose — help
// the team see which designs are on track, at risk, or behind, and what
// action is needed. Each garment ("design") runs the same fixed 30-day,
// 9-milestone checklist. Ticking a box records today's date. Status
// (on track / at risk / behind) is derived automatically from today's
// date vs. the next unticked milestone's target date — nothing is typed
// unless a design falls behind, and then only four short fields.

export const DESIGN_MILESTONES = [
  { day: 1, label: "Order Confirmed" },
  { day: 3, label: "Measurement Done" },
  { day: 6, label: "Fabric Ordered" },
  { day: 10, label: "Pattern Complete" },
  { day: 15, label: "First Sample" },
  { day: 18, label: "Fitting" },
  { day: 21, label: "Production" },
  { day: 26, label: "QC" },
  { day: 30, label: "Delivered" },
];

export const DELAY_REASONS = ["Customer", "Supplier", "Factory", "Internal", "Other"];

export const RAW_CUSTOMERS = [
  {
    orderId: "AC704791",
    name: "Lau Yoke Foong",
    pic: "Winnie",
    designs: ["2-piece gown", "2-piece set (Halter cream)", "Blazer dress set", "Denim dress with kimono belt"],
  },
  {
    orderId: "AC708336",
    name: "Ngaw Yin Yin",
    pic: null,
    designs: ["Embroidery 2-piece set gown", "CNY 3-piece set", "Minimal Batik 2-piece set"],
  },
  {
    orderId: "AC708363",
    name: "Eileen Chong",
    pic: "Winnie",
    designs: ["Couture dress"],
  },
  {
    orderId: "AC708378",
    name: "Jacqueline Lim Sweet Chuen",
    pic: "Winnie",
    designs: [
      "Formal Men's Shirt",
      "Denim dress",
      "Casual woman shirt (longsleeve)",
      "Casual woman sleeve (shortsleeve)",
      "Lace long dress",
    ],
  },
  {
    orderId: "AC709889",
    name: "Chrissie Mulyani Tamara",
    pic: null,
    designs: [],
  },
  {
    orderId: "AC711105",
    name: "Gigi Lee Daphne Tai",
    pic: "Winnie",
    designs: [
      "Denim Lace 2-piece set",
      "Jumpsuit with cotton belt",
      "Business casual 2-piece set",
      "Brocade short dress",
      "Lace 2-piece set",
      "Halter lace dress",
      "Denim Gradient 2-piece set",
      "Kebaya 2-piece set",
    ],
  },
  {
    orderId: "AC-DAISY",
    name: "Daisy",
    pic: "Winnie",
    designs: [
      "Black Lace Dress",
      "Kebaya 2-Piece Set",
      "AC234 Jumpsuit",
      "Pants (AC015)",
      "Blazer & Dress",
      "Lace Blazer Set",
      "Blue Elegant Set",
      "Yellow Flowy Dress",
    ],
  },
  {
    orderId: "AC710836",
    name: "Triny",
    pic: "Jocelyn",
    designs: [
      "Lace dress",
      "Jumpsuit",
      "Batik 2-Piece Set",
      "Denim 2-piece set",
      "Family Lace 3-Piece Set (Husband + Child)",
      "Cargo pants",
      "Lace skirt",
    ],
  },
  {
    orderId: "AC714321",
    name: "MS",
    pic: null,
    designs: [],
  },
  {
    orderId: "AC724948",
    name: "Cheryl",
    pic: null,
    designs: ["Pilates outerwear"],
  },
  {
    orderId: "AC742773",
    name: "Ann Gie",
    pic: null,
    designs: ["2-piece set Navy Jumpsuit", "2-piece set Lightblue Jumpsuit"],
  },
];

// Flatten every customer's garments into one list of trackable designs.
let seq = 0;
export const BASE_DESIGNS = RAW_CUSTOMERS.flatMap((c) =>
  c.designs.map((name) => {
    seq += 1;
    return {
      id: `D${String(seq).padStart(3, "0")}`,
      name,
      customer: c.name,
      pic: c.pic,
      orderId: c.orderId,
      timeline: null,
    };
  })
);

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function startDesignTimeline(startDate = new Date()) {
  const start = startOfDay(startDate);
  return {
    startDate: start,
    milestones: DESIGN_MILESTONES.map((m) => {
      const target = new Date(start);
      target.setDate(target.getDate() + (m.day - 1));
      return { ...m, targetDate: target, done: false, completedDate: null };
    }),
    delay: null,
  };
}

// Automatic status: on_track / at_risk / behind / completed / not_started.
// "Behind" = today's date has passed the next unticked milestone's target.
export function designStatus(design, today = new Date()) {
  if (!design.timeline) return { key: "not_started", label: "Not Started", emoji: "⚪" };

  const t = startOfDay(today);
  const currentDay = Math.floor((t - design.timeline.startDate) / 86400000) + 1;
  const next = design.timeline.milestones.find((m) => !m.done);

  if (!next) return { key: "completed", label: "Completed", emoji: "✅", currentDay };

  let key;
  if (currentDay < next.day) key = "on_track";
  else if (currentDay === next.day) key = "at_risk";
  else key = "behind";

  const labels = { on_track: "On Track", at_risk: "At Risk", behind: "Behind" };
  const emojis = { on_track: "🟢", at_risk: "🟡", behind: "🔴" };
  return { key, label: labels[key], emoji: emojis[key], currentDay, nextMilestone: next };
}

export function expectedVsActual(design, today = new Date()) {
  if (!design.timeline) return { expected: null, next: null };
  const { milestones } = design.timeline;
  const t = startOfDay(today);
  const currentDay = Math.floor((t - design.timeline.startDate) / 86400000) + 1;
  // Expected = the last milestone whose target day has arrived; if it's done,
  // "expected" naturally advances to whichever one is still pending.
  const dueOrOverdue = milestones.filter((m) => m.day <= currentDay);
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
