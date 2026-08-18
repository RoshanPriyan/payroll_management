import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../api/adminAuthApi.js';
import { useAuth } from '../../context/auth/useAuth.js';
import { ROLES } from '../../services/auth/authSession.js';
import LandingPage from '../landing/LandingPage.jsx';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm = {
  email: '',
  password: '',
};

function getLoginErrorMessage(error) {
  return error.response?.data?.detail
    || error.response?.data?.message
    || 'Unable to sign in. Please try again.';
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (auth.authenticated && auth.role === ROLES.SUPER_ADMIN) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    const email = form.email.trim();

    if (!email) {
      return 'Email is required.';
    }

    if (!emailPattern.test(email)) {
      return 'Enter a valid email address.';
    }

    if (!form.password) {
      return 'Password is required.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await adminAuthApi.login({
        email: form.email.trim(),
        password: form.password,
      });
      const adminData = response.data?.data || {};

      if (String(adminData.role || '').toUpperCase() !== ROLES.SUPER_ADMIN || !adminData.access_token) {
        setError('This account does not have Super Admin access.');
        return;
      }

      const session = auth.login(adminData, { role: ROLES.SUPER_ADMIN });

      if (!session.isAuthenticated) {
        setError('Login response did not include a valid session token.');
        return;
      }

      setSuccess(response.data?.message || 'User login successfully');
      navigate('/admin/dashboard', { replace: true });
    } catch (loginError) {
      setError(getLoginErrorMessage(loginError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adminLoginPage">
      <LandingPage />
      <div className="landing-page adminLoginModalLayer">
        <div className="auth-backdrop adminLoginBackdrop" role="presentation">
          <div className="auth-dialog modal-content-custom adminLoginDialog" role="dialog" aria-modal="true">
            <div className="modal-header-custom auth-header">
              <h5>
                <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
                Payroll Pro Admin Console
              </h5>
            </div>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <p className="adminLoginSubtitle">Super Admin Login</p>

              <label>
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@mail.com"
                  className="form-control-custom"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <div className="adminPasswordField">
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    className="form-control-custom"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="adminPasswordToggle"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={loading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true"></i>
                  </button>
                </div>
              </label>

              {error && <p className="auth-error" role="alert">{error}</p>}
              {success && <p className="auth-success" role="alert">{success}</p>}

              <button className="btn-gradient auth-submit" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
