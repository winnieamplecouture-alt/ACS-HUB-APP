import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { BASE_DESIGNS, startDesignTimeline } from "../data/designs";

const STORAGE_KEY = "acs-hub-designs-v1";

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
    targetDate: m.targetDate ? new Date(m.targetDate) : null,
    completedDate: m.completedDate ? new Date(m.completedDate) : null,
  };
}

function reviveDesigns(designs) {
  return designs.map((d) => {
    if (!d.timeline) return d;
    return {
      ...d,
      timeline: {
        ...d.timeline,
        startDate: new Date(d.timeline.startDate),
        milestones: d.timeline.milestones.map(reviveMilestone),
      },
    };
  });
}

function loadInitialDesigns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BASE_DESIGNS;
    return reviveDesigns(JSON.parse(raw));
  } catch {
    return BASE_DESIGNS;
  }
}

const DesignsContext = createContext(null);

export function DesignsProvider({ children }) {
  const [designs, setDesigns] = useState(loadInitialDesigns);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
    } catch {
      // storage full or unavailable — edits still work for this session
    }
  }, [designs]);

  const value = useMemo(
    () => ({
      designs,
      getDesign: (id) => designs.find((d) => d.id === id),

      startTimeline: (id, startDate = new Date()) => {
        setDesigns((prev) =>
          prev.map((d) => (d.id === id ? { ...d, timeline: startDesignTimeline(startDate) } : d))
        );
      },

      toggleMilestone: (id, day, done, completedDate = new Date(), note = null) => {
        setDesigns((prev) =>
          prev.map((d) => {
            if (d.id !== id || !d.timeline) return d;
            const milestones = d.timeline.milestones.map((m) =>
              m.day === day ? { ...m, done, completedDate: done ? completedDate : null, note: done ? note : null } : m
            );
            return { ...d, timeline: { ...d.timeline, milestones } };
          })
        );
      },

      setDelay: (id, delay) => {
        setDesigns((prev) =>
          prev.map((d) => (d.id === id && d.timeline ? { ...d, timeline: { ...d.timeline, delay } } : d))
        );
      },

      addDesign: (customer, { name, category, remark, pic }) => {
        let newId;
        setDesigns((prev) => {
          newId = nextDesignId(prev);
          return [...prev, { id: newId, name, customer, pic: pic || null, category: category || "", remark: remark || "", timeline: null }];
        });
        return newId;
      },

      updateDesign: (id, patch) => {
        setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      },

      renameDesignId: (oldId, newId) => {
        const trimmed = newId.trim();
        if (!trimmed || trimmed === oldId) return { ok: false, error: null };
        if (designs.some((d) => d.id === trimmed)) {
          return { ok: false, error: `${trimmed} is already in use by another design.` };
        }
        setDesigns((prev) => prev.map((d) => (d.id === oldId ? { ...d, id: trimmed } : d)));
        return { ok: true, error: null };
      },
    }),
    [designs]
  );

  return <DesignsContext.Provider value={value}>{children}</DesignsContext.Provider>;
}

export function useDesigns() {
  const ctx = useContext(DesignsContext);
  if (!ctx) throw new Error("useDesigns must be used within DesignsProvider");
  return ctx;
}
