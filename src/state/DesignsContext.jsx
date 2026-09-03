import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_DESIGNS, DESIGN_DECK_LINKS_BY_CUSTOMER, TECHNICAL_SKETCH_LINKS_BY_CUSTOMER, startDesignTimeline } from "../data/designs";
import { DEFAULT_TIMELINE_TEMPLATES, STANDARD_STAGES, stagesToMilestones, templateKeyForDesign } from "../data/timelineTemplates";

const STORAGE_KEY = "acs-hub-designs-v2";
const DELETED_STORAGE_KEY = "acs-hub-deleted-designs-v1";
const TEMPLATES_STORAGE_KEY = "acs-hub-timeline-templates-v4";
const STAFF_STORAGE_KEY = "acs-hub-staff-v1";
const BATCHES_STORAGE_KEY = "acs-hub-batches-v1";
const CUSTOMERS_STORAGE_KEY = "acs-hub-customers-v1";
const RETENTION_DAYS = 30;

function genUid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Seed designs (the 44 that ship with the app) get a deterministic uid tied
// to their original CDS code, so it stays the same even after a rename —
// that's what lets us look their bundled photo back up below.
function baseUid(id) {
  return `base-${id}`;
}

// Every design gets its own permanent, never-shown, never-edited uid. The
// CDS code (`id`) is just an editable label — using it as the delete/update
// key was the bug where two similar-looking codes could end up referring to
// (or clobbering) the same record. All mutations below key off uid instead.
function ensureUids(designs) {
  return designs.map((d) => (d.uid ? d : { ...d, uid: baseUid(d.id) }));
}

// Every design belongs to a batch (manpower-limited intake round). Anything
// that predates the batch feature — the 44 seed designs included — belongs
// to Batch 1.
function ensureBatch(designs) {
  return designs.map((d) => (d.batch ? d : { ...d, batch: 1 }));
}

// The 44 seed designs' photos are already embedded as data URIs in the
// shipped JS bundle (baked in at build time) — re-saving them into
// localStorage on every edit was blowing the browser's per-origin quota
// (a few MB of photos, written on every single change), which made saves
// silently fail. So: strip a design's photo out of what we persist
// whenever it's still exactly the bundled seed photo, and restore it from
// this map on load. Only genuinely uploaded/changed photos get persisted.
const SEED_PHOTO_BY_UID = new Map(BASE_DESIGNS.map((d) => [baseUid(d.id), d.photo]));

function stripSeedPhoto(d) {
  if (d.photo !== undefined && SEED_PHOTO_BY_UID.get(d.uid) === d.photo) {
    const { photo: _photo, ...rest } = d;
    return rest;
  }
  return d;
}

function restoreSeedPhoto(d) {
  if (d.photo === undefined && SEED_PHOTO_BY_UID.has(d.uid)) {
    return { ...d, photo: SEED_PHOTO_BY_UID.get(d.uid) };
  }
  return d;
}

// Defensive net: if two designs ever end up with the same CDS code (however
// that happened), disambiguate every one after the first so they can never
// be confused with each other again.
function dedupeIds(designs) {
  const seen = new Set();
  return designs.map((d) => {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      return d;
    }
    let candidate = `${d.id}-dup`;
    let n = 2;
    while (seen.has(candidate)) candidate = `${d.id}-dup${n++}`;
    seen.add(candidate);
    return { ...d, id: candidate };
  });
}

function loadInitialStaff() {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to defaults
  }
  const fromDesigns = [...new Set(BASE_DESIGNS.map((d) => d.pic).filter(Boolean))];
  return fromDesigns.length ? fromDesigns : ["Winnie"];
}

function loadInitialTemplates() {
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) return DEFAULT_TIMELINE_TEMPLATES;
    const parsed = JSON.parse(raw);
    // merge over defaults so a template added in a later app version isn't lost
    return { ...DEFAULT_TIMELINE_TEMPLATES, ...parsed };
  } catch {
    return DEFAULT_TIMELINE_TEMPLATES;
  }
}

function nextDesignId(designs) {
  const max = designs.reduce((m, d) => {
    const n = parseInt(d.id.split(".")[1] ?? "0", 10);
    return n > m ? n : m;
  }, 0);
  return `CDS1.${max + 1}`;
}

function nextBatchId(batches) {
  return batches.reduce((m, b) => (b.id > m ? b.id : m), 0) + 1;
}

function reviveMilestone(m) {
  return {
    ...m,
    completedDate: m.completedDate ? new Date(m.completedDate) : null,
  };
}

// Migrate milestones saved before due dates became rolling (they carried a
// fixed cumulative `day` instead of each stage's own `days` length).
function migrateMilestoneDays(milestones) {
  let prevDay = 0;
  return milestones.map((m) => {
    if (m.days !== undefined) return m;
    const days = Math.max((m.day ?? prevDay) - prevDay, 0);
    prevDay = m.day ?? prevDay;
    return { ...m, days };
  });
}

function reviveDesign(d) {
  if (!d.timeline) return d;
  return {
    ...d,
    timeline: {
      ...d.timeline,
      startDate: new Date(d.timeline.startDate),
      milestones: migrateMilestoneDays(d.timeline.milestones).map(reviveMilestone),
    },
  };
}

// Old stage names that got renamed or folded into the new standard list —
// so progress recorded under the old name still lands on the right stage.
const LEGACY_LABEL_ALIASES = {
  Production: "Production Team",
  "Holiday Check": "Quality Check",
};

// One-time upgrade for a timeline started before the full standard stage
// list existed (it may only have had e.g. Consultation / Sketch Development
// / Production / Hybrid Processing). Every stage whose name matches a
// standard stage (directly or via the alias above) keeps its done/date/note
// exactly as recorded; every standard stage that's new just gets added,
// pending. Any old stage that doesn't correspond to a standard one at all
// is kept as a custom step, inserted where it originally sat in sequence,
// so nothing already recorded is ever lost.
function migrateToStandardStages(design, templates) {
  if (!design.timeline || design.timeline.standardized) return design;

  const template = templates[templateKeyForDesign(design)];
  const standardMilestones = stagesToMilestones(template.stages);
  const standardLabels = new Set(STANDARD_STAGES.map((s) => s.label));
  const oldMilestones = design.timeline.milestones;

  const oldByLabel = new Map();
  for (const m of oldMilestones) {
    oldByLabel.set(LEGACY_LABEL_ALIASES[m.label] || m.label, m);
  }

  const newMilestones = standardMilestones.map((s) => {
    const old = oldByLabel.get(s.label);
    return old
      ? { label: s.label, days: s.days, done: old.done, completedDate: old.completedDate, note: old.note, category: old.category ?? null }
      : { label: s.label, days: s.days, done: false, completedDate: null, note: null };
  });

  let insertAfter = -1;
  for (const old of oldMilestones) {
    const canonical = LEGACY_LABEL_ALIASES[old.label] || old.label;
    if (standardLabels.has(canonical)) {
      insertAfter = newMilestones.findIndex((m) => m.label === canonical);
      continue;
    }
    // Only carry an unmatched old stage forward if it actually has recorded
    // progress — an untouched, never-started legacy stage adds nothing the
    // new standard list doesn't already cover.
    if (old.done || old.note || old.completedDate) {
      newMilestones.splice(insertAfter + 1, 0, { ...old, custom: true });
      insertAfter += 1;
    }
  }

  return { ...design, timeline: { ...design.timeline, milestones: newMilestones, standardized: true } };
}

// Ongoing sync (runs every load, not one-time): if the standard stage list
// gains a new stage after a design already standardized its timeline (e.g.
// "Technical Sketch" added later), insert it — pending, not done — at the
// position it belongs in. Every stage already on the timeline, and
// everything recorded on it, is left exactly as-is; this only ever adds.
function insertMissingStandardStages(design, templates) {
  if (!design.timeline) return design;

  const template = templates[templateKeyForDesign(design)];
  const standardMilestones = stagesToMilestones(template.stages);
  const existingLabels = new Set(design.timeline.milestones.map((m) => m.label));
  if (standardMilestones.every((s) => existingLabels.has(s.label))) return design;

  const milestones = [...design.timeline.milestones];
  standardMilestones.forEach((s, idx) => {
    if (existingLabels.has(s.label)) return;
    let insertAt = 0;
    for (let i = idx - 1; i >= 0; i--) {
      const pos = milestones.findIndex((m) => m.label === standardMilestones[i].label);
      if (pos !== -1) {
        insertAt = pos + 1;
        break;
      }
    }
    milestones.splice(insertAt, 0, { label: s.label, days: s.days, done: false, completedDate: null, note: null });
    existingLabels.add(s.label);
  });

  return { ...design, timeline: { ...design.timeline, milestones } };
}

// Ongoing sync (runs every load, not one-time): fills in a design's Canva
// deck / technical sketch link from the known-customer directory above, but
// only when that field is still blank — a link already set (by the seed
// data, or typed in by hand) is never touched or overwritten.
function applyKnownLinks(design) {
  const patch = {};
  if (!design.designDeckLink && DESIGN_DECK_LINKS_BY_CUSTOMER[design.customer]) {
    patch.designDeckLink = DESIGN_DECK_LINKS_BY_CUSTOMER[design.customer];
  }
  if (!design.technicalSketchLink && TECHNICAL_SKETCH_LINKS_BY_CUSTOMER[design.customer]) {
    patch.technicalSketchLink = TECHNICAL_SKETCH_LINKS_BY_CUSTOMER[design.customer];
  }
  return Object.keys(patch).length ? { ...design, ...patch } : design;
}

function loadInitialDesigns(templates) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ensureBatch(dedupeIds(ensureUids(BASE_DESIGNS))).map(applyKnownLinks);
    const withUids = ensureUids(JSON.parse(raw));
    return ensureBatch(
      dedupeIds(
        withUids.map((d) =>
          applyKnownLinks(insertMissingStandardStages(migrateToStandardStages(reviveDesign(restoreSeedPhoto(d)), templates), templates))
        )
      )
    );
  } catch {
    return ensureBatch(dedupeIds(ensureUids(BASE_DESIGNS))).map(applyKnownLinks);
  }
}

function loadInitialBatches() {
  try {
    const raw = localStorage.getItem(BATCHES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to default
  }
  return [{ id: 1, name: "Batch 1" }];
}

function loadInitialCustomers() {
  try {
    const raw = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to default
  }
  return [];
}

function loadInitialDeleted(templates) {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((entry) => ({
      ...entry,
      design: insertMissingStandardStages(migrateToStandardStages(reviveDesign(restoreSeedPhoto(entry.design)), templates), templates),
    }));
  } catch {
    return [];
  }
}

function isExpired(entry) {
  const ageMs = Date.now() - new Date(entry.deletedAt).getTime();
  return ageMs > RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

const DesignsContext = createContext(null);

export function DesignsProvider({ children }) {
  const [templates, setTemplates] = useState(loadInitialTemplates);
  const [designs, setDesigns] = useState(() => loadInitialDesigns(templates));
  const [deletedDesigns, setDeletedDesigns] = useState(() => loadInitialDeleted(templates));
  const [staff, setStaff] = useState(loadInitialStaff);
  const [batches, setBatches] = useState(loadInitialBatches);
  const [customers, setCustomers] = useState(loadInitialCustomers);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs.map(stripSeedPhoto)));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [designs]);

  useEffect(() => {
    try {
      const compact = deletedDesigns.map((entry) => ({ ...entry, design: stripSeedPhoto(entry.design) }));
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(compact));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [deletedDesigns]);

  useEffect(() => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [templates]);

  useEffect(() => {
    try {
      localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(BATCHES_STORAGE_KEY, JSON.stringify(batches));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(customers));
    } catch {
      // storage full or unavailable (e.g. a large agreement PDF) — edits still work for this session
    }
  }, [customers]);

  // Purge anything past the 30-day retention window — checked once when the
  // app opens, which is as close to "automatic" as a backend-less app gets.
  useEffect(() => {
    setDeletedDesigns((prev) => prev.filter((entry) => !isExpired(entry)));
  }, []);

  const value = useMemo(
    () => ({
      designs,
      deletedDesigns,
      templates,
      getDesign: (id) => designs.find((d) => d.id === id),

      templateForDesign: (design) => templates[templateKeyForDesign(design)],

      startTimeline: (uid, startDate = new Date()) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid) return d;
            const template = templates[templateKeyForDesign(d)];
            const milestoneDefs = stagesToMilestones(template.stages);
            return { ...d, timeline: startDesignTimeline(startDate, milestoneDefs) };
          })
        );
      },

      setStageDays: (templateKey, stageKey, days) => {
        setTemplates((prev) => ({
          ...prev,
          [templateKey]: {
            ...prev[templateKey],
            stages: prev[templateKey].stages.map((s) => (s.key === stageKey ? { ...s, days: Math.max(0, Number(days) || 0) } : s)),
          },
        }));
      },

      toggleMilestone: (uid, index, done, completedDate = new Date(), note = null, category = null) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid || !d.timeline) return d;
            const milestones = d.timeline.milestones.map((m, i) =>
              i === index
                ? { ...m, done, completedDate: done ? completedDate : null, note: done ? note : null, category: done ? category : null }
                : m
            );
            return { ...d, timeline: { ...d.timeline, milestones } };
          })
        );
      },

      addMilestone: (uid, { label, days, afterIndex }) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid || !d.timeline) return d;
            const milestones = [...d.timeline.milestones];
            milestones.splice(afterIndex + 1, 0, {
              label,
              days: Math.max(0, Number(days) || 0),
              done: false,
              completedDate: null,
              note: null,
              custom: true,
            });
            return { ...d, timeline: { ...d.timeline, milestones } };
          })
        );
      },

      removeMilestone: (uid, index) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid || !d.timeline) return d;
            return { ...d, timeline: { ...d.timeline, milestones: d.timeline.milestones.filter((_, i) => i !== index) } };
          })
        );
      },

      // Copies a design's whole timeline — stage list, days, and every
      // done/date/note recorded so far — onto one or more other designs
      // that were worked on in parallel with it. Replaces whatever timeline
      // (if any) those designs already had.
      duplicateTimeline: (sourceUid, targetUids) => {
        setDesigns((prev) => {
          const source = prev.find((d) => d.uid === sourceUid);
          if (!source?.timeline) return prev;
          const targetSet = new Set(targetUids);
          return prev.map((d) =>
            targetSet.has(d.uid)
              ? { ...d, timeline: { ...source.timeline, milestones: source.timeline.milestones.map((m) => ({ ...m })), delay: null } }
              : d
          );
        });
      },

      setDelay: (uid, delay) => {
        setDesigns((prev) =>
          prev.map((d) => (d.uid === uid && d.timeline ? { ...d, timeline: { ...d.timeline, delay } } : d))
        );
      },

      addDesign: (customer, { name, category, remark, pic, batch }) => {
        let newId;
        setDesigns((prev) => {
          newId = nextDesignId(prev);
          return [
            ...prev,
            applyKnownLinks({
              uid: genUid(),
              id: newId,
              name,
              customer,
              pic: pic || null,
              category: category || "",
              remark: remark || "",
              batch: batch || 1,
              timeline: null,
            }),
          ];
        });
        return newId;
      },

      updateDesign: (uid, patch) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid) return d;
            const merged = { ...d, ...patch };
            // Customer approval is a one-way flag — once set, nothing can ever unset it again.
            if (d.quotationApproved) merged.quotationApproved = true;
            return merged;
          })
        );
      },

      // The only way quotationApproved is ever set to true. There is deliberately
      // no counterpart to un-set it — once a customer approves a quotation,
      // that record is permanent, including against admin edits.
      approveQuotation: (uid) => {
        setDesigns((prev) =>
          prev.map((d) =>
            d.uid === uid && !d.quotationApproved
              ? { ...d, quotationApproved: true, quotationApprovedAt: new Date().toISOString() }
              : d
          )
        );
      },

      renameDesignId: (uid, newId) => {
        const trimmed = newId.trim();
        const current = designs.find((d) => d.uid === uid);
        if (!current || !trimmed || trimmed === current.id) return { ok: false, error: null };
        if (designs.some((d) => d.uid !== uid && d.id === trimmed)) {
          return { ok: false, error: `${trimmed} is already in use by another design.` };
        }
        setDesigns((prev) => prev.map((d) => (d.uid === uid ? { ...d, id: trimmed } : d)));
        return { ok: true, error: null };
      },

      deleteDesign: (uid) => {
        const target = designs.find((d) => d.uid === uid);
        if (!target) return;
        setDesigns((prev) => prev.filter((d) => d.uid !== uid));
        setDeletedDesigns((prev) => [...prev, { design: target, deletedAt: new Date().toISOString() }]);
      },

      restoreDesign: (uid) => {
        const entry = deletedDesigns.find((e) => e.design.uid === uid);
        if (!entry) return;
        setDesigns((prev) => {
          const collides = prev.some((d) => d.id === entry.design.id);
          const restored = collides ? { ...entry.design, id: `${entry.design.id}-restored` } : entry.design;
          return [...prev, restored];
        });
        setDeletedDesigns((prev) => prev.filter((e) => e.design.uid !== uid));
      },

      permanentlyDeleteDesign: (uid) => {
        setDeletedDesigns((prev) => prev.filter((e) => e.design.uid !== uid));
      },

      staff,

      addStaff: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setStaff((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
      },

      removeStaff: (name) => {
        setStaff((prev) => prev.filter((s) => s !== name));
      },

      batches,

      addBatch: (name) => {
        let created;
        setBatches((prev) => {
          const id = nextBatchId(prev);
          created = { id, name: name?.trim() || `Batch ${id}` };
          return [...prev, created];
        });
        return created;
      },

      renameBatch: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return { ok: false, error: "Batch name can't be empty." };
        setBatches((prev) => prev.map((b) => (b.id === id ? { ...b, name: trimmed } : b)));
        return { ok: true };
      },

      deleteBatch: (id) => {
        if (batches.length <= 1) return { ok: false, error: "You need at least one batch." };
        if (designs.some((d) => (d.batch || 1) === id)) {
          return { ok: false, error: "This batch still has designs in it — move or delete them first." };
        }
        setBatches((prev) => prev.filter((b) => b.id !== id));
        return { ok: true };
      },

      customers,

      getCustomerByName: (name) => customers.find((c) => c.name === name),

      addCustomer: (details) => {
        const uid = genUid();
        setCustomers((prev) => [...prev, { uid, createdAt: new Date().toISOString(), ...details }]);
        return uid;
      },

      updateCustomer: (uid, patch) => {
        setCustomers((prev) => prev.map((c) => (c.uid === uid ? { ...c, ...patch } : c)));
      },
    }),
    [designs, deletedDesigns, templates, staff, batches, customers]
  );

  return <DesignsContext.Provider value={value}>{children}</DesignsContext.Provider>;
}

export function useDesigns() {
  const ctx = useContext(DesignsContext);
  if (!ctx) throw new Error("useDesigns must be used within DesignsProvider");
  return ctx;
}
