import { createContext, useContext, useMemo, useState } from "react";
import { DESIGNS } from "../data/designs";

const DesignsContext = createContext(null);

export function DesignsProvider({ children }) {
  const [designs, setDesigns] = useState(DESIGNS);

  const value = useMemo(
    () => ({
      designs,
      updateDesign: (id, patch) => {
        setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
      },
      getDesign: (id) => designs.find((d) => d.id === id),
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
