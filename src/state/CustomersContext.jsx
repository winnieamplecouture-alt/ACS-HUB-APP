import { createContext, useContext, useMemo, useState } from "react";
import { CUSTOMERS, startDesignTimeline } from "../data/customers";

const CustomersContext = createContext(null);

function updateDesignIn(customer, designId, patch) {
  return {
    ...customer,
    designs: customer.designs.map((d) => (d.id === designId ? { ...d, ...patch } : d)),
  };
}

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState(CUSTOMERS);

  const value = useMemo(
    () => ({
      customers,
      getCustomer: (orderId) => customers.find((c) => c.orderId === orderId),

      beginDesignTimeline: (orderId, designId, startDate) => {
        setCustomers((prev) =>
          prev.map((c) =>
            c.orderId === orderId ? updateDesignIn(c, designId, { timeline: startDesignTimeline(startDate) }) : c
          )
        );
      },

      updateMilestone: (orderId, designId, day, actualDate) => {
        setCustomers((prev) =>
          prev.map((c) => {
            if (c.orderId !== orderId) return c;
            return {
              ...c,
              designs: c.designs.map((d) => {
                if (d.id !== designId || !d.timeline) return d;
                const milestones = d.timeline.milestones.map((m) =>
                  m.day === day ? { ...m, actualDate } : m
                );
                const currentDay = Math.max(...milestones.filter((m) => m.actualDate).map((m) => m.day));
                return { ...d, timeline: { ...d.timeline, milestones, currentDay } };
              }),
            };
          })
        );
      },
    }),
    [customers]
  );

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>;
}

export function useCustomers() {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error("useCustomers must be used within CustomersProvider");
  return ctx;
}
