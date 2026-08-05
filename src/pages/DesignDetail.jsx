import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, StickyNote, Check, Minus } from "lucide-react";
import StatusPill from "../components/StatusPill";
import UpdateProgressModal from "../components/UpdateProgressModal";
import { MILESTONE_TEMPLATE, STATUS } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

function formatDate(d) {
  if (!d) return "–";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function DesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesign, updateDesign } = useDesigns();
  const design = getDesign(id);
  const [modalOpen, setModalOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState(design?.notes ?? "");
  const [editingNote, setEditingNote] = useState(false);

  if (!design) {
    return (
      <div className="space-y-4">
        <Link to="/designs" className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to list
        </Link>
        <p className="text-sm text-gray-500">Design "{id}" was not found.</p>
      </div>
    );
  }

  const nextMilestone = MILESTONE_TEMPLATE.find((m) => m.day >= design.day) ?? MILESTONE_TEMPLATE.at(-1);
  const dueInDays = Math.max(0, nextMilestone.day - design.day);

  function saveNotes() {
    updateDesign(design.id, { notes: noteDraft });
    setEditingNote(false);
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate("/designs")}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Back to list
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Design {design.id}</h1>
        <div className="flex items-center gap-3">
          <StatusPill status={design.status} />
          <span className="text-sm font-medium text-gray-500">
            Day {design.day} / 30
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr_240px]">
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <User size={16} className="text-gray-400" /> Customer Info
            </h2>
            <dl className="space-y-3 text-sm">
              <Field label="Customer" value={design.customer} />
              <Field label="Phone" value={design.phone} />
              <Field label="Order Date (Day 1)" value={design.orderDate} />
              <Field label="Target Delivery" value={design.targetDelivery} />
            </dl>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">PIC</h2>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User size={16} className="text-gray-400" />
              {design.pic}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <StickyNote size={16} className="text-gray-400" /> Notes
            </h2>
            {editingNote ? (
              <div className="space-y-2">
                <textarea
                  autoFocus
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setNoteDraft(design.notes ?? "");
                      setEditingNote(false);
                    }}
                    className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setEditingNote(true)}
                className="w-full rounded-lg border border-dashed border-gray-200 px-3 py-2 text-left text-sm text-gray-400 hover:border-gray-300 hover:text-gray-500"
              >
                {design.notes || "Click to add notes..."}
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">30-Day Timeline</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
                <th className="pb-2 pr-3">Day</th>
                <th className="pb-2 pr-3">Milestone (What should be completed)</th>
                <th className="pb-2 pr-3">Target Date</th>
                <th className="pb-2">Actual Date</th>
              </tr>
            </thead>
            <tbody>
              {design.timeline.map((row) => (
                <tr key={row.day} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-3 text-gray-500">Day {row.day}</td>
                  <td className="py-2.5 pr-3 text-gray-800">{row.milestone}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{formatDate(row.targetDate)}</td>
                  <td className="py-2.5">
                    {row.actualDate ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check size={14} /> {formatDate(row.actualDate)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-300">
                        <Minus size={14} /> –
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Status</h2>
            {design.status === STATUS.COMPLETED ? (
              <p className="text-sm text-emerald-600">Delivered to customer.</p>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="text-gray-400">Next Milestone</p>
                <p className="font-medium text-gray-900">Day {nextMilestone.day}</p>
                <p className="text-gray-700">{nextMilestone.label}</p>
                <p className="mt-1 text-xs text-gray-400">
                  Due in {dueInDays} day{dueInDays === 1 ? "" : "s"}
                </p>
              </div>
            )}
            {design.status !== STATUS.COMPLETED && (
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Update Progress
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <UpdateProgressModal
          design={design}
          milestone={nextMilestone}
          onClose={() => setModalOpen(false)}
          onSave={(patch) => updateDesign(design.id, patch)}
        />
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
    </div>
  );
}
