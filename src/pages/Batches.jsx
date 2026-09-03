import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layers, Plus, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useDesigns } from "../state/DesignsContext";

export default function Batches() {
  const { designs, batches, addBatch, renameBatch, deleteBatch } = useDesigns();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

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

  function startEdit(e, b) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(b.id);
    setEditName(b.name);
    setConfirmDeleteId(null);
  }

  function saveEdit(e, id) {
    e.preventDefault();
    e.stopPropagation();
    renameBatch(id, editName);
    setEditingId(null);
  }

  function cancelEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(null);
  }

  function startDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteError("");
    setConfirmDeleteId(id);
  }

  function confirmDelete(e, id) {
    e.preventDefault();
    e.stopPropagation();
    const result = deleteBatch(id);
    if (!result.ok) {
      setDeleteError(result.error);
      return;
    }
    setConfirmDeleteId(null);
  }

  function cancelDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteId(null);
    setDeleteError("");
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
          const isEditing = editingId === b.id;
          const isConfirmingDelete = confirmDeleteId === b.id;
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
                <div className="flex items-center gap-1">
                  {!isEditing && !isConfirmingDelete && (
                    <>
                      <button
                        onClick={(e) => startEdit(e, b)}
                        title="Rename batch"
                        className="rounded-md p-1 text-gray-300 opacity-0 transition hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(e) => startDelete(e, b.id)}
                        title="Delete batch"
                        className="rounded-md p-1 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                      <ChevronRight size={16} className="text-gray-300 transition group-hover:text-blue-500" />
                    </>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className="mt-3" onClick={(e) => e.preventDefault()}>
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(e, b.id);
                      if (e.key === "Escape") cancelEdit(e);
                    }}
                    className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm font-semibold text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={cancelEdit} className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
                      Cancel
                    </button>
                    <button
                      onClick={(e) => saveEdit(e, b.id)}
                      className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : isConfirmingDelete ? (
                <div className="mt-3" onClick={(e) => e.preventDefault()}>
                  <p className="text-sm font-medium text-gray-800">Delete "{b.name}"?</p>
                  {deleteError && <p className="mt-1 text-xs text-red-600">{deleteError}</p>}
                  <div className="mt-2 flex justify-end gap-2">
                    <button onClick={cancelDelete} className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100">
                      Cancel
                    </button>
                    <button
                      onClick={(e) => confirmDelete(e, b.id)}
                      className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <h2 className="text-base font-semibold text-gray-900">{b.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.customers.size} customer{s.customers.size === 1 ? "" : "s"} · {s.designs} design{s.designs === 1 ? "" : "s"}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
