import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  Layers,
  Calendar,
  BarChart3,
  Award,
  Settings,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/designs", label: "Designs", icon: Shirt },
  { to: "/batches", label: "Batches", icon: Layers },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/best-practice", label: "Best Practice", icon: Award },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-sm font-bold text-white">
          AC
        </div>
        <span className="text-[15px] font-semibold text-gray-900">AC Customisation</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-gray-100 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
          W
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">Winnie</p>
          <p className="truncate text-xs text-gray-500">AC Customisation</p>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>
    </aside>
  );
}
