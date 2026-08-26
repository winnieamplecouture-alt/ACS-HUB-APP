import { createContext, useContext, useMemo, useState } from "react";
import { BASE_DESIGNS, startDesignTimeline } from "../data/designs";

function nextDesignId(designs) {
  const max = designs.reduce((m, d) => {
    const n = parseInt(d.id.split(".")[1] ?? "0", 10);
    return n > m ? n : m;
  }, 0);
  return `CDS1.${max + 1}`;
}

const DesignsContext = createContext(null);

export function DesignsProvider({ children }) {
  const [designs, setDesigns] = useState(BASE_DESIGNS);

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
