import axios from 'axios';
import { clearAuthSession, getAccessToken } from '../services/auth/authSession.js';

const LOGIN_PATHS = ['/login', '/admin/login'];
const LOGIN_API_PATHS = ['/v1/users/login', '/v1/admin/login'];

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isLoginApiRequest(url = '') {
  return LOGIN_API_PATHS.some((path) => url.includes(path));
}

function isAlreadyOnLoginPage(pathname = '') {
  return LOGIN_PATHS.includes(pathname);
}

function hasTokenError(error) {
  const status = error.response?.status;
  const message = String(error.response?.data?.message || error.response?.data?.detail || '').toLowerCase();

  return status === 401 || message.includes('invalid token') || message.includes('token expired') || message.includes('expired token');
}

function redirectToLogin() {
  if (typeof window === 'undefined') return;

  const { pathname } = window.location;
  if (isAlreadyOnLoginPage(pathname)) return;

  clearAuthSession();
  window.dispatchEvent(new Event('auth:session-expired'));

  const loginPath = pathname.startsWith('/admin') ? '/admin/login' : '/login';
  window.location.replace(loginPath);
}

function redirectToUnauthorized() {
  if (typeof window === 'undefined') return;

  if (window.location.pathname === '/unauthorized') return;
  window.location.replace('/unauthorized');
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = isLoginApiRequest(error.config?.url);

    if (!isAuthRequest && hasTokenError(error)) {
      redirectToLogin();
    } else if (!isAuthRequest && error.response?.status === 403) {
      redirectToUnauthorized();
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
