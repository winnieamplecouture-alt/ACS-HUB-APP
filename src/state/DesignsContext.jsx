import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_DESIGNS, startDesignTimeline } from "../data/designs";
import { DEFAULT_TIMELINE_TEMPLATES, stagesToMilestones, templateKeyForDesign } from "../data/timelineTemplates";

const STORAGE_KEY = "acs-hub-designs-v2";
const DELETED_STORAGE_KEY = "acs-hub-deleted-designs-v1";
const TEMPLATES_STORAGE_KEY = "acs-hub-timeline-templates-v2";
const STAFF_STORAGE_KEY = "acs-hub-staff-v1";
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

function loadInitialDesigns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return dedupeIds(ensureUids(BASE_DESIGNS));
    const withUids = ensureUids(JSON.parse(raw));
    return dedupeIds(withUids.map((d) => reviveDesign(restoreSeedPhoto(d))));
  } catch {
    return dedupeIds(ensureUids(BASE_DESIGNS));
  }
}

function loadInitialDeleted() {
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((entry) => ({ ...entry, design: reviveDesign(restoreSeedPhoto(entry.design)) }));
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
  const [designs, setDesigns] = useState(loadInitialDesigns);
  const [deletedDesigns, setDeletedDesigns] = useState(loadInitialDeleted);
  const [templates, setTemplates] = useState(loadInitialTemplates);
  const [staff, setStaff] = useState(loadInitialStaff);

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

      toggleMilestone: (uid, index, done, completedDate = new Date(), note = null) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.uid !== uid || !d.timeline) return d;
            const milestones = d.timeline.milestones.map((m, i) =>
              i === index ? { ...m, done, completedDate: done ? completedDate : null, note: done ? note : null } : m
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

      setDelay: (uid, delay) => {
        setDesigns((prev) =>
          prev.map((d) => (d.uid === uid && d.timeline ? { ...d, timeline: { ...d.timeline, delay } } : d))
        );
      },

      addDesign: (customer, { name, category, remark, pic }) => {
        let newId;
        setDesigns((prev) => {
          newId = nextDesignId(prev);
          return [...prev, { uid: genUid(), id: newId, name, customer, pic: pic || null, category: category || "", remark: remark || "", timeline: null }];
        });
        return newId;
      },

      updateDesign: (uid, patch) => {
        setDesigns((prev) => prev.map((d) => (d.uid === uid ? { ...d, ...patch } : d)));
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
    }),
    [designs, deletedDesigns, templates, staff]
  );

  return <DesignsContext.Provider value={value}>{children}</DesignsContext.Provider>;
}

export function useDesigns() {
  const ctx = useContext(DesignsContext);
  if (!ctx) throw new Error("useDesigns must be used within DesignsProvider");
  return ctx;
}
