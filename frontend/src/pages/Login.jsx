import { Navigate } from 'react-router-dom';
import LandingPage from './landing/LandingPage.jsx';

export default function Login() {
  const token = localStorage.getItem('access_token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage initialModalMode="login" />;
}
