import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Sparkles } from "lucide-react";
import { useDesigns } from "../state/DesignsContext";

const REASONS = ["Fast Customer Reply", "Fabric Ready", "Factory Slot Available", "Clear Measurement"];

function daysTaken(design) {
  const last = design.timeline.milestones.at(-1);
  return Math.round((last.completedDate - design.timeline.startDate) / 86400000) + 1;
}

export default function BestPractice() {
  const { designs } = useDesigns();
  const [checked, setChecked] = useState({});
  const [saved, setSaved] = useState({});

  const completed = designs.filter((d) => d.timeline && d.timeline.milestones.every((m) => m.done));

  function toggle(designId, reason) {
    setChecked((prev) => {
      const forDesign = prev[designId] ?? {};
      return { ...prev, [designId]: { ...forDesign, [reason]: !forDesign[reason] } };
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Best Practice</h1>
        <p className="mt-1 text-sm text-gray-500">Learn from what made a design finish early.</p>
      </div>

      {completed.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Sparkles size={22} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No completed designs yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
            Tick off all 9 steps on a design's timeline and its completion will show up here.
          </p>
          <Link to="/designs" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            Go to Designs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((d) => {
            const days = daysTaken(d);
            const isSaved = saved[d.id];
            return (
              <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-gray-900">{d.id}</span>
                  <span className="text-sm text-gray-500">
                    {d.name} · {d.customer}
                  </span>
                  <span className="text-sm text-emerald-600">Completed in {days} Days</span>
                </div>

                <h3 className="mb-2 mt-4 text-sm font-semibold text-gray-900">Why?</h3>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={!!checked[d.id]?.[r]}
                        onChange={() => toggle(d.id, r)}
                        disabled={isSaved}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                      />
                      {r}
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => setSaved((s) => ({ ...s, [d.id]: true }))}
                  disabled={isSaved}
                  className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isSaved ? "cursor-default bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Bookmark size={16} />
                  {isSaved ? "Saved as Best Practice" : "Save as Best Practice"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
