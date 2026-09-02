import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { designStatus, withTargetDates } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DOT_COLOR = {
  on_track: "bg-emerald-500",
  at_risk: "bg-amber-500",
  behind: "bg-red-500",
};

const PILL_STYLE = {
  on_track: "bg-emerald-50 text-emerald-700 border-emerald-100",
  at_risk: "bg-amber-50 text-amber-700 border-amber-100",
  behind: "bg-red-50 text-red-700 border-red-100",
};

function toKey(d) {
  const x = new Date(d);
  if (isNaN(x.getTime())) return "invalid";
  x.setHours(0, 0, 0, 0);
  return x.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const { designs } = useDesigns();
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const entries = useMemo(() => {
    const withNext = [];
    for (const d of designs) {
      if (!d.timeline) continue;
      const next = withTargetDates(d).find((m) => !m.done);
      if (!next) continue;
      withNext.push({ design: d, milestone: next, status: designStatus(d) });
    }
    return withNext;
  }, [designs]);

  const byDate = useMemo(() => {
    const map = new Map();
    for (const entry of entries) {
      const key = toKey(entry.milestone.targetDate);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
    return map;
  }, [entries]);

  const needsAttention = useMemo(
    () =>
      entries
        .filter((e) => e.status.key === "behind" || e.status.key === "at_risk")
        .sort((a, b) => new Date(a.milestone.targetDate) - new Date(b.milestone.targetDate)),
    [entries]
  );

  const todayKey = toKey(new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: new Date(year, month - 1, daysInPrevMonth - firstWeekday + 1 + i), inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Every started design's next target date, plotted so you can see what's due and what's urgent.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="w-32 text-center text-sm font-semibold text-gray-900">
            {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </span>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => {
              const d = new Date();
              d.setDate(1);
              setCursor(d);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      {needsAttention.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            <h2 className="text-base font-semibold text-gray-900">Do These First</h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{needsAttention.length}</span>
          </div>
          <div className="mt-3 space-y-1.5">
            {needsAttention.slice(0, 6).map(({ design, milestone, status }) => (
              <Link
                key={design.uid}
                to={`/designs/${design.id}`}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm hover:opacity-80 ${PILL_STYLE[status.key]}`}
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{design.id}</span>
                  <span className="text-xs opacity-80">{design.customer}</span>
                  <span>{milestone.label}</span>
                </span>
                <span className="text-xs font-medium">{formatDate(milestone.targetDate)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/60">
          {WEEKDAYS.map((w) => (
            <div key={w} className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map(({ date, inMonth }, i) => {
            const key = toKey(date);
            const dayEntries = byDate.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={i}
                className={`min-h-[92px] border-b border-r border-gray-100 p-1.5 [&:nth-child(7n)]:border-r-0 ${
                  inMonth ? "bg-white" : "bg-gray-50/40"
                }`}
              >
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isToday ? "bg-blue-600 font-semibold text-white" : inMonth ? "text-gray-700" : "text-gray-300"
                  }`}
                >
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEntries.slice(0, 3).map(({ design, milestone, status }) => (
                    <Link
                      key={design.uid}
                      to={`/designs/${design.id}`}
                      className="flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-[11px] font-medium hover:opacity-80"
                      title={`${design.id} · ${milestone.label}`}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLOR[status.key]}`} />
                      <span className="truncate text-gray-700">{design.id}</span>
                    </Link>
                  ))}
                  {dayEntries.length > 3 && <p className="px-1 text-[10px] text-gray-400">+{dayEntries.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
