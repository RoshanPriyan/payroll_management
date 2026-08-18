import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/auth/useAuth.js';
import { ROLES } from '../services/auth/authSession.js';
import LandingPage from './landing/LandingPage.jsx';

export default function Login() {
  const auth = useAuth();

  if (auth.authenticated) {
    return <Navigate to={auth.role === ROLES.SUPER_ADMIN ? '/admin/dashboard' : '/dashboard'} replace />;
  }

  return <LandingPage initialModalMode="login" />;
}
