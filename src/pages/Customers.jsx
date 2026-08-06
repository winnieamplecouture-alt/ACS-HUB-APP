import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import StagePill from "../components/StagePill";
import { useCustomers } from "../state/CustomersContext";

const GROUPS = [
  { key: "All", label: "All", stages: null },
  { key: "onboarding", label: "Onboarding", stages: ["agreement", "personal_image", "consultation"] },
  { key: "design", label: "In Design", stages: ["sketch", "technical_sketch"] },
  { key: "sourcing", label: "Sourcing", stages: ["fabric_sourcing"] },
  { key: "production", label: "Production", stages: ["pattern_making", "fitting", "alterations"] },
  { key: "completed", label: "Completed", stages: ["completed"] },
];

export default function Customers() {
  const { customers } = useCustomers();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeGroup = searchParams.get("group") ?? "All";

  const groupCounts = useMemo(() => {
    const counts = {};
    GROUPS.forEach((g) => {
      counts[g.key] = g.stages ? customers.filter((c) => g.stages.includes(c.stage.key)).length : customers.length;
    });
    return counts;
  }, [customers]);

  const filtered = useMemo(() => {
    const group = GROUPS.find((g) => g.key === activeGroup);
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      const matchesGroup = !group?.stages || group.stages.includes(c.stage.key);
      const matchesQuery =
        !q || c.name.toLowerCase().includes(q) || c.orderId.toLowerCase().includes(q);
      return matchesGroup && matchesQuery;
    });
  }, [customers, activeGroup, query]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search customer / order ID..."
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200">
        {GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => setSearchParams(g.key === "All" ? {} : { group: g.key })}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeGroup === g.key ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {g.label} ({groupCounts[g.key]})
            {activeGroup === g.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Tier</th>
              <th className="px-5 py-3">PIC</th>
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Designs</th>
              <th className="px-5 py-3">Package</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.orderId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-5 py-3 text-gray-700">{c.tier}</td>
                <td className="px-5 py-3 text-gray-700">{c.pic ?? <span className="text-gray-400">Unassigned</span>}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{c.orderId}</td>
                <td className="px-5 py-3">
                  <StagePill stage={c.stage} />
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {c.designs.length === 0 ? (
                    <span className="text-gray-400">Not started</span>
                  ) : (
                    `${c.designs.filter((d) => d.sketch === "confirmed").length} confirmed / ${c.designs.length}`
                  )}
                </td>
                <td className="px-5 py-3 text-gray-700">{c.packageAmount}</td>
                <td className="px-5 py-3">
                  <Link
                    to={`/customers/${c.orderId}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm text-gray-400">
                  No customers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
