import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Designs from "./pages/Designs";
import DesignDetail from "./pages/DesignDetail";
import Reports from "./pages/Reports";
import BestPractice from "./pages/BestPractice";
import Settings from "./pages/Settings";
import Placeholder from "./pages/Placeholder";
import { DesignsProvider } from "./state/DesignsContext";

export default function App() {
  return (
    <DesignsProvider>
      <div className="flex min-h-screen bg-[#f5f6f8]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/designs" element={<Designs />} />
            <Route path="/designs/:id" element={<DesignDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/best-practice" element={<BestPractice />} />
            <Route path="/calendar" element={<Placeholder title="Calendar" />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </DesignsProvider>
  );
}
