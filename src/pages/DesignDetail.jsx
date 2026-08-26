import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Check, Shirt } from "lucide-react";
import StatusPill from "../components/StatusPill";
import { DELAY_REASONS, designStatus, expectedVsActual } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

function toISO(d) {
  return new Date(d).toISOString().slice(0, 10);
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
  const [startDateInput, setStartDateInput] = useState(toISO(new Date()));
  const [milestoneDates, setMilestoneDates] = useState({});

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
        <div className="flex items-center gap-4">
          {design.photo ? (
            <img src={design.photo} alt={design.name} className="h-16 w-16 shrink-0 rounded-xl border border-gray-200 object-cover" />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300">
              <Shirt size={22} />
            </span>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Design {design.id}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {design.name}
              {design.category && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{design.category}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={status} />
          <span className="text-sm font-medium text-gray-500">
            {status.currentDay ? `Day ${status.currentDay} / 30` : "Not started"}
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <Field label="Customer" value={design.customer} />
          <Field icon={<User size={14} />} label="PIC" value={design.pic ?? "Unassigned"} />
          {design.remark && <Field label="Remark" value={design.remark} />}
        </dl>
      </div>

      {!design.timeline ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">This design hasn't started its 30-day timeline yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-gray-400">
            If work already started earlier, set the real start date — Day 1 and every target date will be calculated from it.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <input
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              max={toISO(new Date())}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              onClick={() => startTimeline(design.id, new Date(startDateInput))}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Start 30-Day Timeline
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <div className="space-y-4">
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
                {design.timeline.milestones.map((m) => {
                  const dateValue = milestoneDates[m.day] ?? toISO(m.completedDate ?? new Date());
                  return (
                    <li key={m.day} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMilestone(design.id, m.day, !m.done, new Date(dateValue))}
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          m.done ? "border-emerald-500 bg-emerald-500 text-white" : "border-gray-300 bg-white hover:border-gray-400"
                        }`}
                      >
                        {m.done && <Check size={13} />}
                      </button>
                      <span className="w-14 shrink-0 text-xs text-gray-400">Day {m.day}</span>
                      <span className={`flex-1 text-sm ${m.done ? "text-gray-900" : "text-gray-600"}`}>{m.label}</span>
                      {m.done && (
                        <input
                          type="date"
                          value={dateValue}
                          max={toISO(new Date())}
                          onChange={(e) => {
                            const v = e.target.value;
                            setMilestoneDates((prev) => ({ ...prev, [m.day]: v }));
                            toggleMilestone(design.id, m.day, true, new Date(v));
                          }}
                          className="shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs text-emerald-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                        />
                      )}
                    </li>
                  );
                })}
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
