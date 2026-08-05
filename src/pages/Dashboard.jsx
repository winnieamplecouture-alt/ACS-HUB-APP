import { Link } from "react-router-dom";
import { Target, CheckCircle2, Clock, AlertTriangle, TrendingUp, CalendarDays } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";
import StatCard from "../components/StatCard";
import { statusCounts, needAttention, STATUS_STYLES } from "../data/designs";
import { useDesigns } from "../state/DesignsContext";

const MONTHLY_TARGET = 30;
const IN_PROGRESS = 15;
const BEHIND_SCHEDULE = 3;
const COMPLETED = 12;
const SUCCESS_RATE = 72;
const SUCCESS_TARGET = 70;

const trendData = [62, 58, 65, 68, 64, 70, 69, 72].map((v, i) => ({ i, v }));

export default function Dashboard() {
  const { designs } = useDesigns();
  const counts = statusCounts(designs);
  const attention = needAttention(designs);

  const donutData = [
    { name: "On Track", value: counts.onTrack, color: STATUS_STYLES["On Track"].chart },
    { name: "At Risk", value: counts.atRisk, color: STATUS_STYLES["At Risk"].chart },
    { name: "Behind", value: counts.behind, color: STATUS_STYLES["Behind"].chart },
  ];
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
          <CalendarDays size={16} />
          Aug 2025
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Monthly Target"
          value={MONTHLY_TARGET}
          unit="Designs"
          tint="gray"
          icon={<Target size={18} className="text-gray-400" />}
        />
        <StatCard
          label="Completed"
          value={COMPLETED}
          unit="Designs"
          sub={`${Math.round((COMPLETED / MONTHLY_TARGET) * 100)}% of target`}
          tint="green"
          icon={<CheckCircle2 size={18} className="text-emerald-500" />}
        />
        <StatCard
          label="In Progress"
          value={IN_PROGRESS}
          unit="Designs"
          sub={`${Math.round((IN_PROGRESS / MONTHLY_TARGET) * 100)}% of target`}
          tint="amber"
          icon={<Clock size={18} className="text-amber-500" />}
        />
        <StatCard
          label="Behind Schedule"
          value={BEHIND_SCHEDULE}
          unit="Designs"
          sub={`${Math.round((BEHIND_SCHEDULE / MONTHLY_TARGET) * 100)}% of target`}
          tint="red"
          icon={<AlertTriangle size={18} className="text-red-500" />}
        />
        <div className="flex flex-col justify-between rounded-xl border border-violet-100 bg-violet-50 p-4">
          <div className="flex items-start justify-between">
            <span className="text-sm font-medium text-violet-700">30-Day Success Rate</span>
            <TrendingUp size={18} className="text-violet-500" />
          </div>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <span className="text-3xl font-semibold text-gray-900">{SUCCESS_RATE}%</span>
              <p className="mt-1 text-xs text-gray-500">Target: {SUCCESS_TARGET}%</p>
            </div>
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#successGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Designs Status Overview</h2>
          <div className="mt-4 flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    isAnimationActive={false}
                  >
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={d.color} stroke="none" />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-gray-900">{donutTotal}</span>
                <span className="text-xs text-gray-500">Total</span>
              </div>
            </div>
            <div className="space-y-3">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                  <span className="font-medium text-gray-900">
                    {Math.round((d.value / donutTotal) * 100)}% ({d.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Designs Need Attention</h2>
          <div className="mt-4 space-y-2">
            {attention.map((d) => (
              <Link
                key={d.id}
                to={`/designs/${d.id}`}
                className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-4 py-3 hover:bg-red-100/70"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-gray-900">{d.id}</span>
                  <span className="text-sm text-gray-600">{d.customer}</span>
                  <span className="text-sm text-gray-500">Day {d.day} / 30</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  Behind {d.behindDays} day{d.behindDays === 1 ? "" : "s"}
                </span>
              </Link>
            ))}
          </div>
          <Link
            to="/designs?status=Behind"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            View all ({attention.length})
          </Link>
        </div>
      </div>
    </div>
  );
}
