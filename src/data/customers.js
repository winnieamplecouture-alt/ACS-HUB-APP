// Real customer data transcribed from the ACS Customization tracker
// (Google Sheet, "ACS Customization" tab, provided by the user 2026-08-06),
// reconciled with the "Your Journey, Step by Step" customer timeline graphic
// and the internal Customisation Staff SOP (both provided 2026-08-06).
//
// Structure: one customer -> many garment "designs". Onboarding stages
// (Agreement, Personal Image, Consultation) are per-customer. From there,
// each garment runs its own design timeline: Day 1 = start of Sketch
// Development, running through Technical Sketch, Fabric Sourcing,
// Quotation, Production, 1st Fitting, Alterations, 2nd Fitting, and
// Handover. Per the SOP's own ETA ranges that totals ~44 days end to end
// (not a flat 30) — see GARMENT_TIMELINE_TEMPLATE below.

export const STAGE_ORDER = [
  { key: "agreement", label: "Agreement Signed" },
  { key: "personal_image", label: "Personal Image" },
  { key: "consultation", label: "Consultation" },
  { key: "sketch", label: "Sketch" },
  { key: "technical_sketch", label: "Technical Sketch" },
  { key: "fabric_sourcing", label: "Fabric Sourcing & Quotation" },
  { key: "pattern_making", label: "Production" },
  { key: "fitting", label: "1st Fitting" },
  { key: "alterations", label: "Alterations & 2nd Fitting" },
  { key: "completed", label: "Handover" },
];

const PHASE_COLOR = {
  agreement: { text: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", chart: "#9ca3af" },
  personal_image: { text: "text-gray-700", bg: "bg-gray-50", border: "border-gray-200", dot: "bg-gray-400", chart: "#9ca3af" },
  consultation: { text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-500", chart: "#3b82f6" },
  sketch: { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500", chart: "#8b5cf6" },
  technical_sketch: { text: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-500", chart: "#7c3aed" },
  fabric_sourcing: { text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500", chart: "#f59e0b" },
  pattern_making: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", chart: "#f97316" },
  fitting: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", chart: "#ea580c" },
  alterations: { text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500", chart: "#c2410c" },
  completed: { text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", chart: "#22c55e" },
};

export function stageStyle(key) {
  return PHASE_COLOR[key] ?? PHASE_COLOR.agreement;
}

// Per-garment design timeline. Day 1 = start of Sketch Development.
// Day numbers are the cumulative midpoint of each stage's ETA range from
// the "Your Journey, Step by Step" graphic; Sketch Development's 7-10 day
// range is split across Sketch + Technical Sketch since the tracker itself
// treats them as separate steps. ~44 days end to end, matching the SOP's
// stated 35-48 day ETA (which starts a few days earlier, at Consultation).
export const GARMENT_TIMELINE_TEMPLATE = [
  { day: 5, label: "Sketch Confirmed", etaNote: "Sketch Development: 7–10 days (incl. Technical Sketch)" },
  { day: 9, label: "Technical Sketch Done", etaNote: null },
  { day: 14, label: "Fabric Sourcing Complete", etaNote: "Fabric Sourcing: 4–6 days" },
  { day: 16, label: "Quotation Confirmed", etaNote: "Quotation: 1–2 days" },
  { day: 34, label: "Production Complete", etaNote: "Production: 2–3 weeks" },
  { day: 36, label: "1st Fitting Done", etaNote: "1st Fitting: 1–2 days" },
  { day: 42, label: "Alterations Complete", etaNote: "Minor Alterations: 5–7 days" },
  { day: 43, label: "2nd Fitting Done", etaNote: "2nd Fitting: 1 day" },
  { day: 44, label: "Delivered to Customer", etaNote: "Handover: 1 day" },
];

const RAW_CUSTOMERS = [
  {
    orderId: "AC704791",
    name: "Lau Yoke Foong",
    phone: "65 8486 1138",
    email: "lauyokefoong89@gmail.com",
    tier: "Gold",
    discount: "ACS 50%",
    pic: "Winnie",
    registeredDate: "18 May 2026",
    agreementSigned: true,
    agreementFile: "Yoke Foong _ACS_Hub_Customisation_Agreement (1) 2.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,500",
    personalImage: { done: true, note: "Done — 31 May, 4:30pm" },
    consultation: { done: true, note: "Done — 14 Jun 12pm Online, 28 Jun 4pm Online, 26 Jul 3pm" },
    canvaLink: "https://canva.link/bwikambinlaaw3e",
    fabricSourcingNote: "26 Jul: customer confirmed & waiting for production team to update on fabric",
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "2-piece gown", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "2-piece set (Halter cream)", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "Blazer dress set", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "Denim dress with kimono belt", sketch: "pending", techSketch: null, fabric: null },
    ],
  },
  {
    orderId: "AC708336",
    name: "Ngaw Yin Yin",
    phone: "60 17-613 9413",
    email: "ngaw81@gmail.com",
    tier: "Diamond",
    discount: "ACS 55%",
    pic: null,
    registeredDate: "18 May 2026",
    agreementSigned: true,
    agreementFile: "Ngaw YinYin _ACS_Hub_Customisation_Agreement 3.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,250",
    personalImage: { done: true, note: "Postponed — date TBC" },
    consultation: { done: true, note: "Done — 21 Jun (Sun) 3pm Trion. Followed up on 23 Jul" },
    canvaLink: "https://www.canva.com/design/DAHMtWuUrc4/Xy6kxmNYlqrNqz6U3niY9A/edit",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "Embroidery 2-piece set gown", sketch: "confirmed", techSketch: "pending", fabric: null },
      { name: "CNY 3-piece set", sketch: "confirmed", techSketch: "pending", fabric: null },
      { name: "Minimal Batik 2-piece set", sketch: "confirmed", techSketch: "pending", fabric: null },
    ],
    designsNote: "27 Jul: customer confirmed all 3 designs, can proceed to technical sketches",
  },
  {
    orderId: "AC708363",
    name: "Eileen Chong",
    phone: "6012-4919058",
    email: "chong5114@gmail.com",
    tier: "Diamond",
    discount: "FA 55%",
    pic: "Winnie",
    registeredDate: "18 May 2026",
    agreementSigned: true,
    agreementFile: "Eileen Chong_ACS_Hub_Customisation_Agreement_pdf.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,250",
    personalImage: { done: true, note: null },
    consultation: {
      done: true,
      note: "Done — 17 Jun (Wed) 3pm Online, 6 Jul 3pm Online. Followed up 23 Jul. 23 Jul: design confirmed for fabric sourcing",
    },
    canvaLink: "https://canva.link/0wkhpenh3ts5bx4",
    fabricSourcingNote: "Waiting for production team to update on fabric & quotation; customer will confirm sketch after quotation view",
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [{ name: "Couture dress", sketch: "confirmed", techSketch: "done", fabric: "pending" }],
  },
  {
    orderId: "AC708378",
    name: "Jacqueline Lim Sweet Chuen",
    phone: "016-5517807",
    email: "Jacqueline12cu@yahoo.com",
    tier: "Diamond",
    discount: "FA 50%",
    pic: "Winnie",
    registeredDate: "24 May 2026",
    agreementSigned: true,
    agreementFile: "Jacqueline Lim_ACS_Hub_Customisation_Agreement_copy 2.pdf",
    packageAmount: "RM3,000",
    actualAmount: "RM1,400 + RM100 (deposit)",
    personalImage: { done: true, note: "Postponed — date TBC" },
    consultation: { done: true, note: "Done — 16 Jun 12pm Online, 29 Jun 10:30am Online" },
    canvaLink: "https://www.canva.com/design/DAHMPbbcl9E/DOMNPMDJO9W_0rfF0c8PAQ/edit",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "Formal Men's Shirt", sketch: "confirmed", techSketch: "in_progress", fabric: null },
      { name: "Denim dress", sketch: "pending", techSketch: null, fabric: null },
      { name: "Casual woman shirt (longsleeve)", sketch: "pending", techSketch: null, fabric: null },
      { name: "Casual woman sleeve (shortsleeve)", sketch: "pending", techSketch: null, fabric: null },
      { name: "Lace long dress", sketch: "pending", techSketch: null, fabric: null },
    ],
  },
  {
    orderId: "AC709889",
    name: "Chrissie Mulyani Tamara",
    phone: "60 14-360 6162",
    email: "mulyani@gmail.com",
    tier: "Diamond",
    discount: "FA 55%",
    pic: null,
    registeredDate: "28 May 2026",
    agreementSigned: true,
    agreementFile: "Mulyani_ACS_Hub_Customisation_Agreement (1).pdf",
    packageAmount: "RM3,000",
    actualAmount: "RM1,250 + RM100 (deposit)",
    personalImage: {
      done: true,
      note: "Send Personal Image message later once program is ready. Notify customer to proceed to design consultation first.",
    },
    consultation: { done: true, note: "Haven't sent reference — follow up to schedule" },
    canvaLink: "https://www.canva.com/design/DAHMtS1HBqo/BsmPf-VYSkUc-Hq5BRicWg/edit",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [],
  },
  {
    orderId: "AC711105",
    name: "Gigi Lee Daphne Tai",
    phone: "6012-3606236",
    email: "daphnetaibc@gmail.com",
    tier: "Diamond",
    discount: "FA 55%",
    pic: "Winnie",
    registeredDate: "30 May 2026",
    agreementSigned: true,
    agreementFile: "Gigi_ACS_Hub_Customisation_Agreement.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,150 + RM100 (deposit)",
    personalImage: { done: true, note: "Postponed — date TBC" },
    consultation: { done: true, note: "Done — 18 Jun 3pm Trion, 2 Jul (Thu) Trion" },
    canvaLink: "https://canva.link/nypz0m4h4gteuwf",
    fabricSourcingNote: "Pending customer confirmation & waiting for production team to update",
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "Denim Lace 2-piece set", sketch: "confirmed", techSketch: "in_progress", fabric: "pending" },
      { name: "Jumpsuit with cotton belt", sketch: "confirmed", techSketch: "in_progress", fabric: "pending" },
      { name: "Business casual 2-piece set", sketch: "confirmed", techSketch: "in_progress", fabric: "pending" },
      { name: "Brocade short dress", sketch: "confirmed", techSketch: "in_progress", fabric: "pending" },
      { name: "Lace 2-piece set", sketch: "pending", techSketch: null, fabric: null },
      { name: "Halter lace dress", sketch: "pending", techSketch: null, fabric: null },
      { name: "Denim Gradient 2-piece set", sketch: "pending", techSketch: null, fabric: null },
      { name: "Kebaya 2-piece set", sketch: "pending", techSketch: null, fabric: null },
    ],
  },
  {
    orderId: "Paid to different AC account",
    name: "Daisy",
    phone: "60 19-488 0737",
    email: "daisy@inx.my",
    tier: "Diamond",
    discount: "FA 55%",
    pic: "Winnie",
    registeredDate: "1 Jun 2026",
    agreementSigned: true,
    agreementFile: "ACS_Hub_Customisation_Agreement_DAISY.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,150 + RM100 (deposit)",
    personalImage: { done: true, note: "Postponed — date TBC" },
    consultation: { done: true, note: "Sun 28 Jun 3pm Online" },
    canvaLink: "https://canva.link/41p0flmym1sz51m",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "Black Lace Dress", sketch: "pending", techSketch: null, fabric: null },
      { name: "Kebaya 2-Piece Set", sketch: "pending", techSketch: null, fabric: null },
      { name: "AC234 Jumpsuit", sketch: "pending", techSketch: "in_progress", fabric: null },
      { name: "Pants (AC015)", sketch: "pending", techSketch: "in_progress", fabric: null },
      { name: "Blazer & Dress", sketch: "pending", techSketch: null, fabric: null },
      { name: "Lace Blazer Set", sketch: "pending", techSketch: null, fabric: null },
      { name: "Blue Elegant Set", sketch: "pending", techSketch: null, fabric: null },
      { name: "Yellow Flowy Dress", sketch: "pending", techSketch: null, fabric: null },
    ],
  },
  {
    orderId: "AC710836",
    name: "Triny",
    phone: "65 9225 5952",
    email: "trinycharmed@hotmail.com",
    tier: "Diamond",
    discount: "FA 55%",
    pic: "Jocelyn",
    registeredDate: "30 May 2026",
    agreementSigned: true,
    agreementFile: "Triny_ACS_Hub_Customisation_Agreement.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,150 + RM100 (deposit)",
    personalImage: { done: true, note: "Postponed — date TBC" },
    consultation: { done: true, note: "Done — 15 Jun 3pm Trion, 5 Jul 12pm Online. Followed up 23 Jul" },
    canvaLink: "https://canva.link/48b2nuot4gzivid",
    fabricSourcingNote: "Pending customer confirmation & waiting for production team to update",
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "Lace dress", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "Jumpsuit", sketch: "confirmed", techSketch: "pending", fabric: "pending", note: "Pending add-on: husband & son matching top" },
      { name: "Batik 2-Piece Set", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "Denim 2-piece set", sketch: "confirmed", techSketch: "done", fabric: "pending" },
      { name: "Family Lace 3-Piece Set (Husband + Child)", sketch: "pending", techSketch: null, fabric: null },
      { name: "Cargo pants", sketch: "pending", techSketch: "pending", fabric: "pending", note: "Pending design development" },
      { name: "Lace skirt", sketch: "pending", techSketch: "pending", fabric: "pending", note: "Pending design development" },
    ],
  },
  {
    orderId: "AC714321",
    name: "MS",
    phone: "60 12-476 8227",
    email: "mitykinds@gmail.com",
    tier: "Platinum",
    discount: "FA 55%",
    pic: null,
    registeredDate: "6 May 2026",
    agreementSigned: true,
    agreementFile: "MS_ACS_Hub_Customisation_Agreement_MITYKINDS.pdf",
    packageAmount: "RM5,000",
    actualAmount: "RM2,150 + RM100 (deposit)",
    personalImage: {
      done: true,
      note: "Send Personal Image message later once program is ready. Notify customer to proceed to design consultation first.",
    },
    consultation: { done: true, note: "Sent reference — follow up to schedule" },
    canvaLink: "https://www.canva.com/design/DAHMtVtxTSU/yznEnwRXYd7mf4CnzSf2PA/edit",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [],
  },
  {
    orderId: "AC724948",
    name: "Cheryl",
    phone: "60 14-547 7123",
    email: "sunnydoll99@hotmail.com",
    tier: "Bronze",
    discount: null,
    pic: null,
    registeredDate: "22 Jun 2026",
    agreementSigned: true,
    agreementFile: "Cheryl_ACS_Hub_Customisation_Agreement.pdf",
    packageAmount: "RM500",
    actualAmount: "RM500",
    personalImage: { done: false, note: "Not applicable for this package" },
    consultation: { done: true, note: "Consultation done — WIP for sketch options" },
    canvaLink: "https://canva.link/pyt7fdukgylqphm",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [{ name: "Pilates outerwear", sketch: "pending", techSketch: null, fabric: null }],
  },
  {
    orderId: "AC742773",
    name: "Ann Gie",
    phone: "60 16-768 6122",
    email: "anngie0127@gmail.com",
    tier: "Silver",
    discount: null,
    pic: null,
    registeredDate: "19 Jul 2026",
    agreementSigned: true,
    agreementFile: "(ENG)Yap Ann Gie_ACS_Hub_Customisation_Agreement (1).pdf",
    packageAmount: "RM3,000",
    actualAmount: "RM3,000",
    personalImage: { done: false, note: null },
    consultation: { done: true, note: "3 Aug 12pm consultation. Production will start when Batch 2 is released." },
    canvaLink: "https://canva.link/x1ysgbch3hwfqbb",
    fabricSourcingNote: null,
    quotationStatus: null,
    patternMaking: null,
    fitting: null,
    alterations: null,
    completed: false,
    designs: [
      { name: "2-piece set Navy Jumpsuit", sketch: "pending", techSketch: null, fabric: null },
      { name: "2-piece set Lightblue Jumpsuit", sketch: "pending", techSketch: null, fabric: null },
    ],
  },
];

function hasContent(v) {
  if (v === null || v === undefined) return false;
  if (typeof v === "boolean") return v === true;
  if (typeof v === "string") return v.trim() !== "" && v.trim() !== "-";
  return true;
}

export function stageFlags(c) {
  return {
    agreement: c.agreementSigned,
    personal_image: c.personalImage?.done,
    consultation: c.consultation?.done || hasContent(c.consultation?.note),
    sketch: c.designs.length > 0,
    technical_sketch: c.designs.some((d) => hasContent(d.techSketch)),
    fabric_sourcing: c.designs.some((d) => hasContent(d.fabric)) || hasContent(c.quotationStatus),
    pattern_making: hasContent(c.patternMaking),
    fitting: hasContent(c.fitting),
    alterations: hasContent(c.alterations),
    completed: c.completed === true,
  };
}

function computeStage(c) {
  const flags = stageFlags(c);
  let reached = 0;
  STAGE_ORDER.forEach((s, i) => {
    if (flags[s.key]) reached = i;
  });
  return { index: reached, key: STAGE_ORDER[reached].key, label: STAGE_ORDER[reached].label };
}

const FOLLOW_UP_PATTERN = /postponed|tbc|follow up|haven'?t|pending customer|waiting for/i;

function detectFollowUp(c) {
  const candidates = [
    { source: "Fabric Sourcing", note: c.fabricSourcingNote },
    { source: "Consultation", note: c.consultation?.note },
    { source: "Personal Image", note: c.personalImage?.note },
  ].filter((x) => hasContent(x.note));
  const hit = candidates.find((x) => FOLLOW_UP_PATTERN.test(x.note));
  return hit ? { needsFollowUp: true, source: hit.source, note: hit.note } : { needsFollowUp: false, source: null, note: null };
}

export const CUSTOMERS = RAW_CUSTOMERS.map((c) => ({
  ...c,
  designs: c.designs.map((d, i) => ({ id: `${c.orderId}-D${i + 1}`, timeline: null, ...d })),
  stage: computeStage(c),
  followUp: detectFollowUp(c),
}));

export function findCustomer(orderId, customers = CUSTOMERS) {
  return customers.find((c) => c.orderId === orderId);
}

export function stageDistribution(customers = CUSTOMERS) {
  const counts = {};
  STAGE_ORDER.forEach((s) => (counts[s.key] = 0));
  customers.forEach((c) => {
    counts[c.stage.key] += 1;
  });
  return STAGE_ORDER.map((s) => ({ key: s.key, label: s.label, value: counts[s.key] })).filter((s) => s.value > 0);
}

export function totalDesigns(customers = CUSTOMERS) {
  return customers.reduce((sum, c) => sum + c.designs.length, 0);
}

export function designsInTimeline(customers = CUSTOMERS) {
  return customers.flatMap((c) => c.designs.filter((d) => d.timeline));
}

export function startDesignTimeline(startDate = new Date()) {
  return {
    startDate,
    milestones: GARMENT_TIMELINE_TEMPLATE.map((m) => {
      const target = new Date(startDate);
      target.setDate(target.getDate() + (m.day - 1));
      return { ...m, targetDate: target, actualDate: null };
    }),
    currentDay: 1,
  };
}
