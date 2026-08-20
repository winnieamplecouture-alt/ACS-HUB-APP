import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Check } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { DELAY_REASONS, designStatus, expectedVsActual } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

function formatDate(d) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function DesignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDesign, startTimeline, toggleMilestone, setDelay } = useDesigns();
  const design = getDesign(id);

  const [reason, setReason] = useState(design?.timeline?.delay?.reason ?? DELAY_REASONS[0]);
  const [action, setAction] = useState(design?.timeline?.delay?.action ?? "");
  const [delayPic, setDelayPic] = useState(design?.timeline?.delay?.pic ?? design?.pic ?? "");
  const [recoveryDate, setRecoveryDate] = useState(design?.timeline?.delay?.recoveryDate ?? "");

  if (!design) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate("/designs")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
          <ArrowLeft size={16} /> Back to list
        </button>
        <p className="text-sm text-gray-500">Design "{id}" was not found.</p>
      </div>
    );
  }

  const status = designStatus(design);
  const { expected, next } = expectedVsActual(design);

  function saveDelay() {
    setDelay(design.id, { reason, action, pic: delayPic, recoveryDate });
  }

  return (
    <div className="space-y-5">
      <button onClick={() => navigate("/designs")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft size={16} /> Back to list
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Design {design.id}</h1>
          <p className="mt-1 text-sm text-gray-500">{design.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-sm font-medium text-gray-500">
            {status.currentDay ? `Day ${status.currentDay} / 30` : "Not started"}
          </span>
        </div>
      </div>

      {!design.timeline ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">This design hasn't started its 30-day timeline yet.</p>
          <button
            onClick={() => startTimeline(design.id)}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start 30-Day Timeline
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <dl className="space-y-3 text-sm">
                <Field label="Customer" value={design.customer} />
                <Field icon={<User size={14} />} label="PIC" value={design.pic ?? "Unassigned"} />
              </dl>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-semibold text-gray-900">Expected Today</h2>
              <p className="text-sm text-gray-700">
                {expected ? `${expected.done ? "✔" : "○"} ${expected.label}` : "—"}
              </p>
              <h2 className="mb-3 mt-4 text-sm font-semibold text-gray-900">Actual</h2>
              <p className="text-sm text-gray-700">
                {expected ? (expected.done ? `✔ ${expected.label}` : "Not done yet") : "—"}
              </p>
              <h2 className="mb-3 mt-4 text-sm font-semibold text-gray-900">Next Target</h2>
              <p className="text-sm text-gray-700">
                {next ? `Day ${next.day} · ${next.label}` : "All milestones complete"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-900">Timeline Progress</h2>
              <p className="mb-4 text-xs text-gray-400">Tick a step when it's done — the date is recorded automatically.</p>
              <ul className="space-y-3">
                {design.timeline.milestones.map((m) => (
                  <li key={m.day} className="flex items-center gap-3">
                    <button
                      onClick={() => toggleMilestone(design.id, m.day, !m.done)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                        m.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white hover:border-gray-400"
                      }`}
                    >
                      {m.done && <Check size={13} />}
                    </button>
                    <span className="w-14 shrink-0 text-xs text-gray-400">Day {m.day}</span>
                    <span className={`flex-1 text-sm ${m.done ? "text-gray-900" : "text-gray-600"}`}>{m.label}</span>
                    {m.done && m.completedDate && (
                      <span className="shrink-0 text-xs text-emerald-600">{formatDate(m.completedDate)}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {status.key === "behind" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h2 className="mb-4 text-sm font-semibold text-red-800">Behind Schedule</h2>
                <div className="space-y-4">
                  <div>
                    <p className="mb-1.5 text-sm font-medium text-gray-700">Why?</p>
                    <div className="flex flex-wrap gap-2">
                      {DELAY_REASONS.map((r) => (
                        <button
                          key={r}
                          onClick={() => setReason(r)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${
                            reason === r ? "border-red-400 bg-red-100 text-red-800" : "border-gray-200 bg-white text-gray-600"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">Action</label>
                    <input
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="What are we doing about it?"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">PIC</label>
                      <input
                        value={delayPic}
                        onChange={(e) => setDelayPic(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">Expected Recovery Date</label>
                      <input
                        type="date"
                        value={recoveryDate}
                        onChange={(e) => setRecoveryDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                  <button
                    onClick={saveDelay}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs text-gray-400">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-gray-800">{value}</dd>
    </div>
  );
}
