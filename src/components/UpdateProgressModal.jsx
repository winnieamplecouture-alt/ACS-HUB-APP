import { useState } from "react";
import { X, CheckCircle2, Circle, XCircle } from "lucide-react";
import { STATUS } from "../data/designs";

const REASONS = ["Supplier Delay", "Fabric Delay", "Fitting Delay", "Customer Delay", "Machine Breakdown"];
const PICS = ["Tammy", "Winnie", "Factory"];

export default function UpdateProgressModal({ design, milestone, onClose, onSave }) {
  const [progressStatus, setProgressStatus] = useState("completed"); // completed | not_completed | behind
  const [reason, setReason] = useState(REASONS[0]);
  const [actionPlan, setActionPlan] = useState("");
  const [pic, setPic] = useState(design.pic ?? PICS[0]);
  const [recoveryDate, setRecoveryDate] = useState("");

  const dueInDays = Math.max(0, milestone.day - design.day);

  function handleSave() {
    if (progressStatus === "completed") {
      onSave({ status: STATUS.ON_TRACK, day: milestone.day, behindDays: undefined, reason: undefined });
    } else if (progressStatus === "behind") {
      onSave({
        status: STATUS.BEHIND,
        behindDays: 1,
        reason,
        notes: [actionPlan, pic && `PIC: ${pic}`, recoveryDate && `Expected recovery: ${recoveryDate}`]
          .filter(Boolean)
          .join(" · "),
      });
    } else {
      onSave({ status: STATUS.AT_RISK });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-base font-semibold text-gray-900">
            Update Progress – Day {milestone.day}
          </h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Milestone</label>
            <input
              readOnly
              value={milestone.label}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
            <div className="space-y-2">
              <RadioRow
                icon={<CheckCircle2 size={18} className="text-emerald-500" />}
                label="Completed"
                checked={progressStatus === "completed"}
                onChange={() => setProgressStatus("completed")}
              />
              <RadioRow
                icon={<Circle size={18} className="text-gray-400" />}
                label="Not Completed (On Time)"
                checked={progressStatus === "not_completed"}
                onChange={() => setProgressStatus("not_completed")}
              />
              <RadioRow
                icon={<XCircle size={18} className="text-red-500" />}
                label="Behind Schedule"
                checked={progressStatus === "behind"}
                onChange={() => setProgressStatus("behind")}
              />
            </div>
          </div>

          {progressStatus === "behind" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">If Behind, Why?</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Action Plan</label>
                <textarea
                  value={actionPlan}
                  onChange={(e) => setActionPlan(e.target.value)}
                  placeholder="Follow up supplier & need new ETA"
                  rows={2}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">PIC</label>
                  <select
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    {PICS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
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
            </>
          )}

          {progressStatus !== "behind" && (
            <p className="text-xs text-gray-500">
              Next Milestone: Day {milestone.day} · {milestone.label} · Due in {dueInDays} day
              {dueInDays === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function RadioRow({ icon, label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        checked ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
          checked ? "border-blue-600" : "border-gray-300"
        }`}
      >
        {checked && <span className="h-2 w-2 rounded-full bg-blue-600" />}
      </span>
      {icon}
      <span className="text-gray-700">{label}</span>
    </button>
  );
}
