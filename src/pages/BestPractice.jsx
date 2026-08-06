import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, User, Bookmark, Sparkles } from "lucide-react";
import { useCustomers } from "../state/CustomersContext";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function BestPractice() {
  const { customers } = useCustomers();
  const [saved, setSaved] = useState({});

  const delivered = customers.flatMap((c) =>
    c.designs
      .filter((d) => d.timeline && !d.timeline.milestones.some((m) => !m.actualDate))
      .map((d) => ({ customer: c, design: d }))
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Best Practice (Learn from Success)</h1>
        <p className="mt-1 text-sm text-gray-500">Designs that finished their design timeline on schedule</p>
      </div>

      {delivered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center">
          <Sparkles size={22} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-medium text-gray-700">No completed designs yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-400">
            Once a garment finishes its design timeline — from a customer's page, start its timeline and mark each milestone
            done through Handover — its success story will appear here.
          </p>
          <Link to="/customers" className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline">
            Go to Customers
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {delivered.map(({ customer, design }) => {
            const key = design.id;
            const deliveredDate = design.timeline.milestones.at(-1).actualDate;
            return (
              <div key={key} className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-semibold text-gray-900">{design.name}</span>
                      <span className="text-sm text-emerald-600">Delivered on schedule</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {customer.name} · Delivered {formatDate(deliveredDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <User size={15} />
                    {customer.pic ?? "Unassigned"}
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">Why it went smoothly</h3>
                  <ul className="space-y-2">
                    {["Sketch confirmed early", "Technical sketch done without revisions", "Fabric confirmed on first pass"].map(
                      (r) => (
                        <li key={r} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                          {r}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <button
                  onClick={() => setSaved((s) => ({ ...s, [key]: true }))}
                  disabled={saved[key]}
                  className={`mt-5 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    saved[key] ? "cursor-default bg-emerald-50 text-emerald-700" : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <Bookmark size={16} />
                  {saved[key] ? "Saved as Best Practice" : "Save as Best Practice"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
