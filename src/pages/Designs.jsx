import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Eye, Shirt } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { designStatus } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const TABS = [
  { key: "All", label: "All" },
  { key: "on_track", label: "On Track" },
  { key: "at_risk", label: "At Risk" },
  { key: "behind", label: "Behind" },
  { key: "completed", label: "Completed" },
  { key: "not_started", label: "Not Started" },
];

export default function Designs() {
  const { designs } = useDesigns();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const activeTab = searchParams.get("status") ?? "All";

  const withStatus = useMemo(() => designs.map((d) => ({ d, status: designStatus(d) })), [designs]);

  const tabCounts = useMemo(() => {
    const counts = { All: withStatus.length };
    TABS.slice(1).forEach((t) => (counts[t.key] = withStatus.filter((x) => x.status.key === t.key).length));
    return counts;
  }, [withStatus]);

  const filtered = withStatus.filter(({ d, status }) => {
    const matchesTab = activeTab === "All" || status.key === activeTab;
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || d.id.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q) || d.name.toLowerCase().includes(q);
    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Designs</h1>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search design / customer..."
            className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams(tab.key === "All" ? {} : { status: tab.key })}
            className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label} ({tabCounts[tab.key]})
            {activeTab === tab.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-blue-600" />}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-5 py-3">Design</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Day</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Next Milestone</th>
              <th className="px-5 py-3">PIC</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ d, status }) => (
              <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {d.photo ? (
                      <img src={d.photo} alt={d.name} className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 object-cover" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-300">
                        <Shirt size={16} />
                      </span>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{d.id}</p>
                      <p className="text-xs text-gray-400">{d.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-700">{d.customer}</td>
                <td className="px-5 py-3 text-gray-500">{status.currentDay ? `Day ${status.currentDay} / 30` : "–"}</td>
                <td className="px-5 py-3">
                  <StatusPill status={status} />
                </td>
                <td className="px-5 py-3 text-gray-700">
                  {status.key === "completed"
                    ? "Delivered"
                    : status.key === "not_started"
                      ? "Day 1 · Order Confirmed"
                      : `${status.nextMilestone.label} (Day ${status.nextMilestone.day})`}
                </td>
                <td className="px-5 py-3 text-gray-700">{d.pic ?? <span className="text-gray-400">Unassigned</span>}</td>
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
