import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminAuthService } from '../services/adminAuthService.js';

export default function AdminProtectedRoute() {
  const location = useLocation();

  if (!adminAuthService.isSuperAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
