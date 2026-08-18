import ProtectedRoute from './ProtectedRoute.jsx';
import { ROLES } from '../services/auth/authSession.js';

export default function AdminRoute() {
  return <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]} loginPath="/admin/login" />;
}
