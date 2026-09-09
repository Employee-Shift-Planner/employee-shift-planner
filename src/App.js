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
import RequireAuth from "./components/auth/RequireAuth";

const protectedPage = (page) => <RequireAuth>{page}</RequireAuth>;

/**
 * Route table only — every screen lives in src/pages and is composed from the
 * shared components in src/components.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate replace to="/" />} />

      <Route path="/schedule" element={protectedPage(<SchedulePage />)} />
      <Route path="/shiftplanner" element={<Navigate replace to="/schedule" />} />
      <Route path="/create-shift" element={protectedPage(<CreateShiftPage />)} />

      <Route path="/employees" element={protectedPage(<EmployeesPage />)} />
      <Route path="/employee" element={<Navigate replace to="/employees" />} />
      <Route path="/employees/:employeeId" element={protectedPage(<EmployeeDetailPage />)} />

      <Route path="/availability" element={protectedPage(<AvailabilityPage />)} />
      <Route path="/reports" element={protectedPage(<ReportsPage />)} />
      <Route path="/notifications" element={protectedPage(<NotificationsPage />)} />
      <Route path="/settings" element={protectedPage(<NotificationsPage variant="settings" />)} />
      <Route path="/mobile" element={protectedPage(<MobilePage />)} />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
