import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SchedulePage from "./pages/SchedulePage";
import CreateShiftPage from "./pages/CreateShiftPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import EmployeeFormPage from "./pages/EmployeeFormPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import TimeOffPage from "./pages/TimeOffPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import MobilePage from "./pages/MobilePage";
import OperationsPage from "./pages/OperationsPage";
import RequireAuth from "./components/auth/RequireAuth";

const MANAGERS = ["Administrator", "Supervisor"];
const ALL_ROLES = [...MANAGERS, "Employee"];
const protectedPage = (page, roles = ALL_ROLES) => <RequireAuth roles={roles}>{page}</RequireAuth>;

/**
 * Route table only — every screen lives in src/pages and is composed from the
 * shared components in src/components.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<Navigate replace to="/" />} />

      <Route path="/schedule" element={protectedPage(<SchedulePage />, MANAGERS)} />
      <Route path="/shiftplanner" element={<Navigate replace to="/schedule" />} />
      <Route path="/create-shift" element={protectedPage(<CreateShiftPage />, MANAGERS)} />

      <Route path="/employees" element={protectedPage(<EmployeesPage />, MANAGERS)} />
      <Route path="/employees/new" element={protectedPage(<EmployeeFormPage />, MANAGERS)} />
      <Route path="/employee" element={<Navigate replace to="/employees" />} />
      <Route path="/employees/:employeeId" element={protectedPage(<EmployeeDetailPage />, MANAGERS)} />
      <Route path="/employees/:employeeId/edit" element={protectedPage(<EmployeeFormPage />, MANAGERS)} />

      <Route path="/availability" element={protectedPage(<AvailabilityPage />, MANAGERS)} />
      <Route path="/time-off" element={protectedPage(<TimeOffPage />)} />
      <Route path="/reports" element={protectedPage(<ReportsPage />, MANAGERS)} />
      <Route path="/notifications" element={protectedPage(<NotificationsPage />)} />
      <Route path="/settings" element={protectedPage(<NotificationsPage variant="settings" />, MANAGERS)} />
      <Route path="/mobile" element={protectedPage(<MobilePage />)} />
      <Route path="/operations" element={protectedPage(<OperationsPage />)} />

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
