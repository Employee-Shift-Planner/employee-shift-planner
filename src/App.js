import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import CreateShiftPage from "./pages/CreateShiftPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MobilePage from "./pages/MobilePage";

/**
 * Route table only — every screen lives in src/pages and is composed from the
 * shared components in src/components.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate replace to="/" />} />

      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/shiftplanner" element={<Navigate replace to="/schedule" />} />
      <Route path="/create-shift" element={<CreateShiftPage />} />

      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/employee" element={<Navigate replace to="/employees" />} />
      <Route path="/employees/:employeeId" element={<EmployeeDetailPage />} />

      <Route path="/availability" element={<AvailabilityPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/settings" element={<NotificationsPage variant="settings" />} />
      <Route path="/mobile" element={<MobilePage />} />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
