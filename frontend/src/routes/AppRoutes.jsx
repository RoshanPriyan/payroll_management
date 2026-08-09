import { Navigate, Route, Routes } from 'react-router-dom';
import AdminProtectedRoute from './AdminProtectedRoute.jsx';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage.jsx';
import AdminLoginPage from '../pages/admin/AdminLoginPage.jsx';
import AdminUsersPage from '../pages/admin/AdminUsersPage.jsx';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import AttendancePage from '../pages/attendance/AttendancePage.jsx';
import DashboardPage from '../pages/dashboard/DashboardPage.jsx';
import LandingPage from '../pages/landing/LandingPage.jsx';
import Login from '../pages/Login.jsx';
import DailyPaymentsPage from '../pages/payments/DailyPaymentsPage.jsx';
import PaymentHistoryPage from '../pages/payments/PaymentHistoryPage.jsx';
import WeeklyPaymentsPage from '../pages/payments/WeeklyPaymentsPage.jsx';
import ReportsPage from '../pages/reports/ReportsPage.jsx';
import SettingsPage from '../pages/settings/SettingsPage.jsx';
import AddWorkerPage from '../pages/workers/AddWorkerPage.jsx';
import EditWorkerPage from '../pages/workers/EditWorkerPage.jsx';
import WorkerListPage from '../pages/workers/WorkerListPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminProtectedRoute />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workers" element={<WorkerListPage />} />
          <Route path="/employees" element={<WorkerListPage />} />
          <Route path="/workers/add" element={<AddWorkerPage />} />
          <Route path="/workers/edit/:id" element={<EditWorkerPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/daily-payments" element={<DailyPaymentsPage />} />
          <Route path="/weekly-payments" element={<WeeklyPaymentsPage />} />
          <Route path="/payroll" element={<WeeklyPaymentsPage />} />
          <Route path="/history" element={<PaymentHistoryPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
