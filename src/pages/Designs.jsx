import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Eye } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { STATUS, statusCounts } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const TABS = [
  { key: "All", label: "All" },
  { key: STATUS.ON_TRACK, label: "On Track" },
  { key: STATUS.AT_RISK, label: "At Risk" },
  { key: STATUS.BEHIND, label: "Behind" },
  { key: STATUS.COMPLETED, label: "Completed" },
];

export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeTab = searchParams.get("status") ?? "All";
  const { designs } = useDesigns();
  const counts = statusCounts(designs);

  const tabCounts = {
    All: counts.total,
    [STATUS.ON_TRACK]: counts.onTrack,
    [STATUS.AT_RISK]: counts.atRisk,
    [STATUS.BEHIND]: counts.behind,
    [STATUS.COMPLETED]: counts.completed,
  };

  const filtered = useMemo(() => {
    return designs.filter((d) => {
      const matchesTab = activeTab === "All" || d.status === activeTab;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || d.id.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [designs, activeTab, query]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Designs</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search design / customer..."
              className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams(tab.key === "All" ? {} : { status: tab.key })}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label} ({tabCounts[tab.key]})
            {activeTab === tab.key && (
              <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Design ID</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Day</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Next Milestone</th>
              <th className="px-5 py-3">PIC</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-3 font-medium text-gray-900">{d.id}</td>
                <td className="px-5 py-3 text-gray-700">{d.customer}</td>
                <td className="px-5 py-3 text-gray-500">Day {d.day} / 30</td>
                <td className="px-5 py-3">
                  <StatusPill status={d.status} />
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {d.status === STATUS.COMPLETED ? "Delivered" : `${d.nextMilestone} (Day ${d.nextMilestoneDay})`}
                </td>
                <td className="px-5 py-3 text-gray-700">{d.pic}</td>
                <td className="px-5 py-3">
                  <Link
                    to={`/designs/${d.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                  No designs match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
