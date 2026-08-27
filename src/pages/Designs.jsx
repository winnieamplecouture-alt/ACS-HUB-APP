import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Eye, Shirt, Plus, X, Trash2, RotateCcw } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { designStatus, CATEGORIES } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const TABS = [
  { key: "All", label: "All" },
  { key: "on_track", label: "On Track" },
  { key: "at_risk", label: "At Risk" },
  { key: "behind", label: "Behind" },
  { key: "completed", label: "Completed" },
  { key: "not_started", label: "Not Started" },
];

const emptyForm = { name: "", category: "", remark: "", pic: "" };

export default function Designs() {
  const { designs, addDesign, deleteDesign, deletedDesigns, restoreDesign } = useDesigns();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [addingFor, setAddingFor] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDeleteUid, setConfirmDeleteUid] = useState(null);
  const [showDeleted, setShowDeleted] = useState(false);
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

  const groups = useMemo(() => {
    const byCustomer = new Map();
    for (const row of filtered) {
      const key = row.d.customer;
      if (!byCustomer.has(key)) byCustomer.set(key, []);
      byCustomer.get(key).push(row);
    }
    return [...byCustomer.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  function startAdd(customer) {
    setAddingFor(customer);
    setForm({ ...emptyForm, pic: designs.find((d) => d.customer === customer)?.pic ?? "" });
  }

  function submitAdd(customer) {
    if (!form.name.trim()) return;
    const newId = addDesign(customer, form);
    setAddingFor(null);
    setForm(emptyForm);
    setSearchParams(activeTab === "All" ? {} : { status: activeTab });
    return newId;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Designs</h1>
        <div className="flex items-center gap-3">
          {!showDeleted && (
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search design / customer..."
                className="w-64 rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          )}
          <button
            onClick={() => setShowDeleted((s) => !s)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium ${
              showDeleted ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Trash2 size={14} />
            Recently Deleted {deletedDesigns.length > 0 && `(${deletedDesigns.length})`}
          </button>
        </div>
      </div>

      {showDeleted ? (
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 bg-gray-50/60 px-5 py-3">
            <p className="text-sm text-gray-500">Deleted designs stay here for 30 days, then are removed automatically.</p>
          </div>
          {deletedDesigns.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-400">Nothing deleted.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-2.5">Design</th>
                  <th className="px-5 py-2.5">Customer</th>
                  <th className="px-5 py-2.5">Deleted</th>
                  <th className="px-5 py-2.5">Expires</th>
                  <th className="px-5 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {deletedDesigns
                  .slice()
                  .sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt))
                  .map(({ design: d, deletedAt }) => {
                    const daysLeft = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 86400000);
                    return (
                      <tr key={d.uid} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{d.id}</p>
                          <p className="truncate text-xs text-gray-400">{d.name}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{d.customer}</td>
                        <td className="px-5 py-3 text-gray-500">{new Date(deletedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</td>
                        <td className="px-5 py-3 text-gray-500">{daysLeft <= 3 ? <span className="text-red-600">{daysLeft}d left</span> : `${daysLeft}d left`}</td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => restoreDesign(d.uid)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <RotateCcw size={13} /> Restore
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>
      ) : (
      <>
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

      <div className="space-y-6">
        {groups.map(([customer, rows]) => (
          <div key={customer} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-5 py-3">
              <h2 className="text-sm font-semibold text-gray-900">
                {customer} <span className="ml-1 font-normal text-gray-400">({rows.length})</span>
              </h2>
              <button
                onClick={() => startAdd(customer)}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus size={14} /> Add Design
              </button>
            </div>

            {addingFor === customer && (
              <div className="border-b border-gray-100 bg-blue-50/40 px-5 py-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Design name (required)"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:col-span-2"
                  />
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    value={form.pic}
                    onChange={(e) => setForm((f) => ({ ...f, pic: e.target.value }))}
                    placeholder="PIC"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <input
                    value={form.remark}
                    onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                    placeholder="Remark (optional)"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:col-span-3"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitAdd(customer)}
                      disabled={!form.name.trim()}
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setAddingFor(null)}
                      className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-500">
                  <th className="px-5 py-2.5">Design</th>
                  <th className="px-5 py-2.5">Day</th>
                  <th className="px-5 py-2.5">Status</th>
                  <th className="px-5 py-2.5">Next Milestone</th>
                  <th className="px-5 py-2.5">PIC</th>
                  <th className="px-5 py-2.5">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ d, status }) => (
                  <tr key={d.uid} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {d.photo ? (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setLightbox(d);
                            }}
                            className="shrink-0"
                          >
                            <img src={d.photo} alt={d.name} className="h-10 w-10 rounded-lg border border-gray-200 object-cover transition hover:opacity-80" />
                          </button>
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-200 text-gray-300">
                            <Shirt size={16} />
                          </span>
                        )}
                        <Link to={`/designs/${d.id}`} className="min-w-0 hover:underline">
                          <p className="font-medium text-gray-900">{d.id}</p>
                          <p className="truncate text-xs text-gray-400">{d.name}</p>
                        </Link>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {status.currentDay ? `Day ${status.currentDay} / ${d.timeline.milestones.at(-1)?.day}` : "–"}
                    </td>
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
                      {confirmDeleteUid === d.uid ? (
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-xs text-red-600">Delete {d.id}?</span>
                          <button
                            onClick={() => {
                              deleteDesign(d.uid);
                              setConfirmDeleteUid(null);
                            }}
                            className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmDeleteUid(null)}
                            className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Link
                            to={`/designs/${d.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => setConfirmDeleteUid(d.uid)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {groups.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center text-sm text-gray-400">
            No designs match your search.
          </div>
        )}
      </div>
      </>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-8"
        >
          <button onClick={() => setLightbox(null)} className="absolute right-6 top-6 text-white/80 hover:text-white">
            <X size={28} />
          </button>
          <img src={lightbox.photo} alt={lightbox.name} className="max-h-full max-w-3xl rounded-lg object-contain" />
        </div>
      )}
    </div>
  );
}
