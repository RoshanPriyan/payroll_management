import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth/useAuth.js';
import { ROLES } from '../services/auth/authSession.js';

export default function ProtectedRoute({ allowedRoles = [ROLES.ADMIN], loginPath = '/login' }) {
  const location = useLocation();
  const auth = useAuth();

  if (!auth.isAuthenticated()) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(auth.role)) {
    return <Navigate to="/unauthorized" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
