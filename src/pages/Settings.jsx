import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useDesigns } from "../state/DesignsContext";
import { totalDays } from "../data/timelineTemplates";

const TEMPLATE_ORDER = ["rtw", "couture", "urgent"];

const TONES = {
  rtw: { border: "border-blue-100", bg: "bg-blue-50", text: "text-blue-700" },
  couture: { border: "border-violet-100", bg: "bg-violet-50", text: "text-violet-700" },
  urgent: { border: "border-red-100", bg: "bg-red-50", text: "text-red-700" },
};

export default function Settings() {
  const { templates, setStageDays, staff, addStaff, removeStaff } = useDesigns();
  const [newStaff, setNewStaff] = useState("");

  function submitStaff() {
    if (!newStaff.trim()) return;
    addStaff(newStaff);
    setNewStaff("");
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Set how many days each stage takes — this is what shapes every design's timeline and whether it shows as on track, at risk, or overdue.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          A design uses its <span className="font-medium text-gray-700">Category</span> (RTW or Couture/High End) to pick a timeline, unless it's
          marked <span className="font-medium text-gray-700">Urgent</span> on its detail page — that always overrides to the Urgent timeline.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-base font-semibold text-gray-900">Staff (PIC list)</h2>
        <p className="mt-1 text-xs text-gray-400">
          Add everyone who can be assigned as PIC — they'll show up in the PIC dropdown on every design's detail page.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {staff.map((name) => (
            <span key={name} className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-3 pr-1.5 text-sm font-medium text-gray-700">
              {name}
              <button onClick={() => removeStaff(name)} className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                <X size={12} />
              </button>
            </span>
          ))}
          {staff.length === 0 && <p className="text-sm text-gray-400">No staff added yet.</p>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={newStaff}
            onChange={(e) => setNewStaff(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitStaff();
            }}
            placeholder="Add staff name, e.g. Arena"
            className="w-56 rounded-lg border border-gray-200 px-3 py-1.5 text-sm placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={submitStaff}
            disabled={!newStaff.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {TEMPLATE_ORDER.map((key) => {
          const template = templates[key];
          const tone = TONES[key];
          const total = totalDays(template.stages);
          return (
            <div key={key} className={`rounded-xl border ${tone.border} bg-white p-5`}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">{template.label}</h2>
                <span className={`rounded-full ${tone.bg} ${tone.text} px-2.5 py-1 text-xs font-semibold`}>{total} days</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">{template.hint}</p>

              <div className="mt-4 space-y-3">
                {template.stages.map((stage) => (
                  <div key={stage.key} className="flex items-center justify-between gap-3">
                    <label htmlFor={`${key}-${stage.key}`} className="text-sm text-gray-700">
                      {stage.label}
                    </label>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <input
                        id={`${key}-${stage.key}`}
                        type="number"
                        min={0}
                        value={stage.days}
                        onChange={(e) => setStageDays(key, stage.key, e.target.value)}
                        className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      />
                      <span className="text-xs text-gray-400">days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400">
        Changes only apply to timelines started after you save them — designs that already have a running timeline keep the dates they started with.
      </p>
    </div>
  );
}
