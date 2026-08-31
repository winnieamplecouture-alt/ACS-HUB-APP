import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Plus, ChevronRight } from "lucide-react";
import { useDesigns } from "../state/DesignsContext";

export default function Batches() {
  const { designs, batches, addBatch } = useDesigns();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");

  const stats = useMemo(() => {
    const byBatch = new Map();
    for (const d of designs) {
      const id = d.batch || 1;
      if (!byBatch.has(id)) byBatch.set(id, { designs: 0, customers: new Set() });
      const s = byBatch.get(id);
      s.designs += 1;
      s.customers.add(d.customer);
    }
    return byBatch;
  }, [designs]);

  function submitAdd() {
    addBatch(name);
    setName("");
    setAdding(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Batches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Orders are accepted in batches based on manpower capacity. Open a batch to add its customers and designs.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> New Batch
        </button>
      </div>

      {adding && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              placeholder={`Batch name (optional, defaults to "Batch ${batches.length + 1}")`}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button onClick={submitAdd} className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Create
            </button>
            <button onClick={() => setAdding(false)} className="rounded-lg px-3.5 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {batches.map((b) => {
          const s = stats.get(b.id) ?? { designs: 0, customers: new Set() };
          return (
            <Link
              key={b.id}
              to={`/designs?batch=${b.id}`}
              className="group flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Layers size={18} />
                </span>
                <ChevronRight size={16} className="text-gray-300 transition group-hover:text-blue-500" />
              </div>
              <div className="mt-3">
                <h2 className="text-base font-semibold text-gray-900">{b.name}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {s.customers.size} customer{s.customers.size === 1 ? "" : "s"} · {s.designs} design{s.designs === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
