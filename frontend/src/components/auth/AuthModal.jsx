import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { authService } from '../../services/authService.js';
import LoginForm from './LoginForm.jsx';
import RegisterForm from './RegisterForm.jsx';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STANDARD_PLAN_ID = 2;

function getRegisterErrorMessage(error) {
  if (!error?.response) {
    return 'Unable to connect to server.';
  }

  const { status, data } = error.response;

  if (status === 500) {
    return 'Something went wrong. Please try again later.';
  }

  if ((status === 400 || status === 409) && data?.message) {
    return data.message;
  }

  return data?.message || 'Something went wrong. Please try again later.';
}

function getLoginErrorMessage(error) {
  if (!error?.response) {
    return 'Unable to connect to server.';
  }

  const { status, data } = error.response;
  const backendMessage = data?.message || data?.detail;

  if (status === 500) {
    return 'Something went wrong. Please try again later.';
  }

  if ((status === 401 || status === 403) && backendMessage) {
    return backendMessage;
  }

  return backendMessage || 'Something went wrong. Please try again later.';
}

export default function AuthModal({ mode, subscriptionPlan = 1, onClose, onSwitch }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const isLogin = mode === 'login';
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const redirectTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        window.clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  if (!mode) return null;

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setError('');
    setSuccess('');
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (busy.current) return;

    if (isLogin) {
      const payload = {
        email: (form.email || '').trim(),
        password: form.password || '',
      };

      if (!payload.email || !payload.password) {
        setError('Email and password are required.');
        return;
      }

      if (!emailPattern.test(payload.email)) {
        setError('Enter a valid email address.');
        return;
      }

      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await authService.login(payload);
        const userData = response.data?.data;
        const session = auth.login(userData, { email: payload.email });

        if (!session.isAuthenticated) {
          setError('Login response did not include a valid session token.');
          return;
        }

        setSuccess(response.data?.message || 'User login successfully');
        redirectTimer.current = window.setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 800);
      } catch (loginError) {
        setError(getLoginErrorMessage(loginError));
      } finally {
        setLoading(false);
      }
      return;
    }

    const phoneDigits = (form.phone_number || '').replace(/\D/g, '');
    const phone = phoneDigits.startsWith('91') ? phoneDigits.slice(2) : phoneDigits;
    const payload = {
      business_name: (form.business_name || '').trim(),
      first_name: (form.first_name || '').trim(),
      last_name: (form.last_name || '').trim(),
      phone,
      email: (form.email || '').trim(),
      password: form.password || '',
      confirm_password: form.confirm_password || '',
      subscription_plan: Number(subscriptionPlan),
    };

    if (Object.values(payload).some((value) => !value)) {
      setError('All fields are required.');
      return;
    }

    if (!emailPattern.test(payload.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(payload.phone)) {
      setError('Enter a valid 10-digit India phone number.');
      return;
    }

    if (payload.password !== payload.confirm_password) {
      setError('Password and confirm password do not match');
      return;
    }

    setLoading(true);
    busy.current = true;
    setError('');
    setSuccess('');

    try {
      const response = await authService.register(payload);
      const defaultMessage = Number(subscriptionPlan) === STANDARD_PLAN_ID
        ? 'Registration successful! Please verify your email to continue with the payment.'
        : 'Registration successful! Please check your email and click the activation link to activate your PayrollPro account.';
      setSuccess(response.data?.message || defaultMessage);
      redirectTimer.current = window.setTimeout(onClose, 2400);
    } catch (registerError) {
      setError(registerError?.response ? getRegisterErrorMessage(registerError) : registerError?.message || getRegisterErrorMessage(registerError));
    } finally {
      busy.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="auth-dialog modal-content-custom" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header-custom auth-header">
          <h5>
            <i className={`fa-solid ${isLogin ? 'fa-right-to-bracket' : 'fa-user-plus'}`} aria-hidden="true"></i>
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h5>
          <button type="button" className="auth-close" aria-label="Close modal" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {isLogin ? <LoginForm form={form} onChange={handleChange} /> : <RegisterForm form={form} onChange={handleChange} />}

          {!isLogin && Number(subscriptionPlan) === STANDARD_PLAN_ID && <div className="auth-payment-summary"><strong>STANDARD</strong><span>30 days · Amount set by server</span></div>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {success && <p className="auth-success" role="alert">{success}</p>}

          <button className="btn-gradient auth-submit" type="submit" disabled={loading || Boolean(success)}>
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button type="button" onClick={() => onSwitch(isLogin ? 'register' : 'login')} disabled={loading}>
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
