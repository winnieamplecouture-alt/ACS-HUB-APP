import { Link } from "react-router-dom";
import { Users, FileCheck2, Shirt, AlertCircle, CalendarDays } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import StatCard from "../components/StatCard";
import { stageDistribution, totalDesigns, stageStyle } from "../data/customers";
import { useCustomers } from "../state/CustomersContext";

export default function Dashboard() {
  const { customers } = useCustomers();
  const agreementsSigned = customers.filter((c) => c.agreementSigned).length;
  const needsFollowUp = customers.filter((c) => c.followUp.needsFollowUp);
  const designs = totalDesigns(customers);
  const distribution = stageDistribution(customers);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Live from the ACS Customization tracker</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <CalendarDays size={16} />
          Aug 2026
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={customers.length}
          unit="Customers"
          tint="gray"
          icon={<Users size={18} className="text-gray-400" />}
        />
        <StatCard
          label="Agreements Signed"
          value={agreementsSigned}
          unit={`of ${customers.length}`}
          tint="green"
          icon={<FileCheck2 size={18} className="text-emerald-500" />}
        />
        <StatCard
          label="Designs Tracked"
          value={designs}
          unit="Garments"
          sub="across all customers"
          tint="purple"
          icon={<Shirt size={18} className="text-violet-500" />}
        />
        <StatCard
          label="Needs Follow-up"
          value={needsFollowUp.length}
          unit={`of ${customers.length}`}
          tint="amber"
          icon={<AlertCircle size={18} className="text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Pipeline Overview</h2>
          <p className="mt-0.5 text-xs text-gray-400">Where every customer currently sits</p>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {distribution.map((d) => (
                      <Cell key={d.key} fill={stageStyle(d.key).chart} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-gray-900">{customers.length}</span>
                <span className="text-xs text-gray-500">Customers</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {distribution.map((d) => (
                <div key={d.key} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stageStyle(d.key).chart }} />
                  <span className="text-gray-600">{d.label}</span>
                  <span className="font-medium text-gray-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Needs Follow-up</h2>
          <p className="mt-0.5 text-xs text-gray-400">Flagged from status notes in the tracker</p>
          <div className="mt-4 space-y-2">
            {needsFollowUp.map((c) => (
              <Link
                key={c.orderId}
                to={`/customers/${c.orderId}`}
                className="flex items-center justify-between gap-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 hover:bg-amber-100/70"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                  <span className="shrink-0 text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="shrink-0 text-sm text-gray-500">{c.stage.label}</span>
                </div>
                <span className="min-w-0 flex-1 truncate text-right text-xs text-amber-700">
                  {c.followUp.source}: {c.followUp.note}
                </span>
              </Link>
            ))}
            {needsFollowUp.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">Nothing flagged right now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
