import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Award } from "lucide-react";
import { withTargetDates } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

function toISO(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function formatShort(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function BestPractice() {
  const { designs } = useDesigns();

  const entries = useMemo(() => {
    const rows = [];
    for (const d of designs) {
      if (!d.timeline) continue;
      for (const m of withTargetDates(d)) {
        if (!m.done || !m.note) continue;
        const onTime = m.completedDate && m.targetDate && toISO(m.completedDate) <= toISO(m.targetDate);
        rows.push({ design: d, milestone: m, onTime });
      }
    }
    return rows.sort((a, b) => new Date(b.milestone.completedDate) - new Date(a.milestone.completedDate));
  }, [designs]);

  const onTime = entries.filter((e) => e.onTime);
  const overdue = entries.filter((e) => !e.onTime);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Best Practice</h1>
        <p className="mt-1 text-sm text-gray-500">Every note left when a timeline step was ticked done, compiled into one report.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">🟢 Completed in Time</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{onTime.length}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">🔴 Overdue</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{overdue.length}</p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Award size={22} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No notes yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
            Tick a step on any design's timeline and its best-practice note will show up here.
          </p>
          <Link to="/designs" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            Go to Designs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Column title="🟢 What's Keeping Us On Time" rows={onTime} tone="emerald" />
          <Column title="🔴 Main Causes of Delay" rows={overdue} tone="red" />
        </div>
      )}
    </div>
  );
}

const TONE_CLASSES = {
  emerald: "border-emerald-100 bg-emerald-50/60",
  red: "border-red-100 bg-red-50/60",
};

function Column({ title, rows, tone }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-xs text-gray-400">Nothing here yet.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map(({ design, milestone }, i) => (
            <li key={`${design.uid}-${i}`} className={`rounded-lg border p-3 text-xs ${TONE_CLASSES[tone]}`}>
              <div className="flex items-center justify-between">
                <Link to={`/designs/${design.id}`} className="font-medium text-gray-900 hover:underline">
                  {design.id} · {design.customer}
                </Link>
                <span className="shrink-0 text-gray-400">{formatShort(milestone.completedDate)}</span>
              </div>
              <p className="mt-1 text-gray-500">{milestone.label} (due {formatShort(milestone.targetDate)})</p>
              {milestone.category && (
                <span className="mt-1 inline-block rounded-full bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                  {milestone.category}
                </span>
              )}
              <p className="mt-1 whitespace-pre-wrap text-gray-700">{milestone.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
