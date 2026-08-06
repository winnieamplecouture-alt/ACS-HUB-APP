import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Reports from "./pages/Reports";
import BestPractice from "./pages/BestPractice";
import Placeholder from "./pages/Placeholder";
import { CustomersProvider } from "./state/CustomersContext";

export default function App() {
  return (
    <CustomersProvider>
      <div className="flex min-h-screen bg-[#f5f6f8]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden px-8 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:orderId" element={<CustomerDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/best-practice" element={<BestPractice />} />
            <Route path="/calendar" element={<Placeholder title="Calendar" />} />
            <Route path="/settings" element={<Placeholder title="Settings" />} />
          </Routes>
        </main>
      </div>
    </CustomersProvider>
  );
}
