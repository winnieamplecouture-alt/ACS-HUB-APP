import { useState } from "react";
import { CheckCircle2, User, Bookmark } from "lucide-react";
import { BEST_PRACTICE } from "../data/designs";

export default function BestPractice() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold text-gray-900">Best Practice (Learn from Success)</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-gray-900">{BEST_PRACTICE.id}</span>
              <span className="text-sm text-emerald-600">
                Completed in {BEST_PRACTICE.completedInDays} days (Ahead {BEST_PRACTICE.aheadDays} days)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-400">{BEST_PRACTICE.date}</p>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <User size={15} />
            {BEST_PRACTICE.pic}
          </div>
        </div>

        <div className="mt-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Why Successful?</h3>
          <ul className="space-y-2">
            {BEST_PRACTICE.reasons.map((r) => (
              <li key={r} className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-emerald-500" />
                {r}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setSaved(true)}
          disabled={saved}
          className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            saved
              ? "cursor-default bg-emerald-50 text-emerald-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <Bookmark size={16} />
          {saved ? "Saved as Best Practice" : "Save as Best Practice"}
        </button>
      </div>
    </div>
  );
}
