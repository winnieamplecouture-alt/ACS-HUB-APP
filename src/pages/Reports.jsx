import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import StagePill from "../components/StagePill";
import { useCustomers } from "../state/CustomersContext";

export default function Reports() {
  const { customers } = useCustomers();
  const needsFollowUp = customers.filter((c) => c.followUp.needsFollowUp);

  const cards = [
    { label: "Total Customers", value: customers.length, tint: "bg-gray-50 border-gray-200 text-gray-700" },
    { label: "Agreements Signed", value: customers.filter((c) => c.agreementSigned).length, tint: "bg-emerald-50 border-emerald-100 text-emerald-700" },
    { label: "In Design (Sketch/Tech Sketch)", value: customers.filter((c) => ["sketch", "technical_sketch"].includes(c.stage.key)).length, tint: "bg-violet-50 border-violet-100 text-violet-700" },
    { label: "Needs Follow-up", value: needsFollowUp.length, tint: "bg-amber-50 border-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Weekly Review</h1>
        <p className="mt-1 text-sm text-gray-500">Snapshot of the ACS Customization pipeline</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className={`rounded-xl border p-4 ${c.tint}`}>
            <p className="text-sm font-medium">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Needs Follow-up</h2>
        <p className="mb-3 text-xs text-gray-400">Flagged from status notes in the tracker (postponed, awaiting reply, pending confirmation)</p>
        <div className="divide-y divide-gray-50">
          {needsFollowUp.map((c) => (
            <Link
              key={c.orderId}
              to={`/customers/${c.orderId}`}
              className="flex items-center justify-between gap-4 py-3 text-sm hover:bg-gray-50/60"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="shrink-0 font-medium text-gray-900">{c.name}</span>
                <span className="shrink-0">
                  <StagePill stage={c.stage} />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-gray-500">
                  {c.followUp.source}: {c.followUp.note}
                </span>
              </div>
              <ChevronRight size={16} className="shrink-0 text-gray-400" />
            </Link>
          ))}
          {needsFollowUp.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">Nothing to follow up on this week.</p>
          )}
        </div>
      </div>
    </div>
  );
}
