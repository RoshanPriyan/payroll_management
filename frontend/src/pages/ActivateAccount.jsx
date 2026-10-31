import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { CheckCircleOutline, EmailOutlined } from '@mui/icons-material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService.js';

let razorpayScriptPromise;

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => { razorpayScriptPromise = null; resolve(false); };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

const activationRequests = new Map();

function activateOnce(token) {
  if (!activationRequests.has(token)) {
    const request = authService.activateAccount(token, { timeout: 10000 });
    activationRequests.set(token, request);
    const clearRequest = () => {
      if (activationRequests.get(token) === request) activationRequests.delete(token);
    };
    request.then(clearRequest, clearRequest);
  }
  return activationRequests.get(token);
}

function getResponseBody(response) {
  // Axios returns the HTTP body in response.data; tolerate a single legacy wrapper.
  const body = response?.data;
  return body?.data && typeof body.data === 'object' && !('success' in body)
    ? body.data
    : body;
}

function getErrorMessage(error) {
  const data = error?.response?.data;
  const detail = typeof data === 'string' ? data : data?.detail || data?.message;
  if (error?.code === 'ECONNABORTED') return 'The request took too long. Check your connection and try again.';
  if (error?.response?.status === 400 || error?.response?.status === 401 || error?.response?.status === 404) {
    if (/expir/i.test(detail || '')) return 'This activation link has expired. Request a new activation email to continue.';
    if (/used|already/i.test(detail || '')) return 'This activation link has already been used. You can sign in or request another activation email.';
    return detail || 'This activation link is invalid. Request a new activation email to continue.';
  }
  if (error?.response?.status >= 500) return 'We could not activate your account right now. Please try again shortly.';
  return detail || 'We could not activate your account. Please check your connection and try again.';
}

function formatDate(dateString) {
  if (typeof dateString !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString || '—';
  const [year, month, day] = dateString.split('-').map(Number);
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [token] = useState(() => searchParams.get('token')?.trim() || '');
  const [state, setState] = useState('ready');
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [paymentToken, setPaymentToken] = useState('');
  const submitting = useRef(false);
  const autoStarted = useRef(false);

  useEffect(() => {
    if (token && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }, [token]);

  const handleActivate = useCallback(async () => {
    if (!token || submitting.current) return;
    submitting.current = true;
    setState('loading');
    setMessage('');
    setSubscription(null);
    try {
      const response = await activateOnce(token);
      const body = getResponseBody(response);
      if (body?.success !== true || !body?.data || typeof body.data !== 'object') {
        throw new Error(body?.message || 'The server returned an unexpected activation response. Please try again.');
      }
      if (body.data.payment_required === true && body.data.payment_token) {
        setPaymentToken(body.data.payment_token);
        setMessage(body.message || 'Email verified. Payment is required to activate your Standard subscription.');
        setState('payment');
        return;
      }
      setSubscription(body.data);
      setMessage(typeof body.message === 'string' && body.message.trim()
        ? body.message
        : 'Your PayrollPro account has been activated successfully.');
      setState('success');
    } catch (error) {
      setState('error');
      setMessage(error?.response ? getErrorMessage(error) : error?.message || getErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  }, [token]);

  useEffect(() => {
    if (!token || autoStarted.current) return;
    autoStarted.current = true;
    handleActivate();
  }, [handleActivate, token]);

  const handlePayment = async () => {
    if (!paymentToken || submitting.current) return;
    submitting.current = true;
    setState('payment-loading');
    setMessage('');
    try {
      const orderResponse = await authService.createPaymentOrder({ subscription_id: 2, payment_token: paymentToken });
      const orderBody = getResponseBody(orderResponse);
      const order = orderBody?.data;
      if (orderBody?.success !== true || !order?.key_id || !order?.order_id || order.amount == null || !order.currency) {
        throw new Error(orderBody?.message || 'The payment order response is missing checkout details.');
      }
      if (!(await loadRazorpay())) throw new Error('Razorpay Checkout could not be loaded. Check your connection and retry.');

      await new Promise((resolve, reject) => {
        let settled = false;
        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          callback(value);
        };
        const checkout = new window.Razorpay({
          key: order.key_id,
          order_id: order.order_id,
          amount: order.amount,
          currency: order.currency,
          name: 'PayrollPro',
          description: 'STANDARD plan - 30 days',
          handler: async (result) => {
            try {
              const verifiedResponse = await authService.verifyPayment({
                razorpay_order_id: result.razorpay_order_id,
                razorpay_payment_id: result.razorpay_payment_id,
                razorpay_signature: result.razorpay_signature,
              });
              const verified = getResponseBody(verifiedResponse);
              if (verified?.success !== true || verified?.data?.payment_status !== 'SUCCESS') {
                throw new Error(verified?.message || 'Payment could not be verified.');
              }
              setSubscription(verified.data);
              setMessage(verified.message || 'Payment verified and your Standard subscription is active.');
              setState('success');
              finish(resolve);
            } catch (error) {
              finish(reject, error);
            }
          },
          modal: { ondismiss: () => finish(reject, new Error('Checkout was closed before payment completed. You can retry payment.')) },
        });
        checkout.on('payment.failed', (failure) => finish(reject, new Error(failure?.error?.description || 'Payment failed. You can retry payment.')));
        checkout.open();
      });
    } catch (error) {
      setMessage(error?.response?.data?.detail || error?.response?.data?.message || error.message || 'Payment failed. You can retry payment.');
      setState('payment');
    } finally {
      submitting.current = false;
    }
  };

  const canRetry = Boolean(token) && state === 'error' && !/already been used/i.test(message);

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg, #f5f8ff 0%, #eaf0ff 100%)' }}>
      <Paper elevation={4} sx={{ width: 'min(100%, 560px)', p: { xs: 3, sm: 5 }, borderRadius: 4, textAlign: 'center' }}>
        <Stack spacing={2.5} alignItems="center">
          <Box aria-hidden="true" sx={{ display: 'grid', placeItems: 'center', width: 64, height: 64, borderRadius: '50%', bgcolor: state === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(37, 99, 235, 0.18)', color: state === 'success' ? '#4ade80' : '#60a5fa' }}>
            {state === 'success' ? <CheckCircleOutline sx={{ fontSize: 40 }} /> : <EmailOutlined sx={{ fontSize: 36 }} />}
          </Box>
          <Typography variant="h4" component="h1" fontWeight={800} color="#142342" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>{state === 'payment' || state === 'payment-loading' ? 'Complete Standard Payment' : 'Activate Your Account'}</Typography>
          {state === 'ready' && token && <Typography sx={{ color: '#aab8d0' }}>Confirm your email address to continue.</Typography>}
          {!token && <Alert severity="error" sx={{ width: '100%', textAlign: 'left' }}>This activation link is invalid or incomplete. You can request a new activation email below.</Alert>}
          {(state === 'loading' || state === 'payment-loading') && (
            <Stack direction="row" spacing={1.25} alignItems="center" role="status">
              <CircularProgress size={22} aria-label="Activating account" />
              <Typography color="text.secondary">{state === 'payment-loading' ? 'Preparing secure checkout…' : 'Verifying your email…'}</Typography>
            </Stack>
          )}
          {state === 'success' && (
            <>
              <Alert severity="success" sx={{ width: '100%', textAlign: 'left' }}>{message}</Alert>
              <Paper variant="outlined" sx={{ width: '100%', p: { xs: 2, sm: 3 }, textAlign: 'left', borderRadius: 3, bgcolor: '#f8faff', borderColor: '#dce6f7' }}>
                <Typography variant="h6" fontWeight={750} color="#142342" sx={{ mb: 2 }}>Your {subscription?.plan === 'FREE' ? 'Free Trial Is Active!' : 'Subscription Is Active!'}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Detail label="Subscription plan" value={subscription?.plan} />
                  <Detail label="Subscription status" value={subscription?.status} />
                  <Detail label="Trial duration" value={subscription?.duration_days == null ? null : `${subscription.duration_days} days`} />
                  <Detail label="Trial start date" value={formatDate(subscription?.start_date)} />
                  <Detail label="Trial end date" value={formatDate(subscription?.end_date)} />
                </Box>
              </Paper>
            </>
          )}
          {(state === 'error' || state === 'payment') && message && <Alert severity={state === 'payment' ? 'info' : 'error'} sx={{ width: '100%', textAlign: 'left' }}>{message}</Alert>}
          {state === 'payment' && <Button type="button" variant="contained" size="large" fullWidth onClick={handlePayment}>Continue to Payment</Button>}
          {state === 'ready' && token && (
            <Button type="button" variant="contained" size="large" fullWidth onClick={handleActivate} disabled={state === 'loading'} startIcon={state === 'loading' ? <CircularProgress size={18} color="inherit" /> : null} sx={{ py: 1.25, bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}>
              Activate My Account
            </Button>
          )}
          {canRetry && <Button type="button" variant="contained" fullWidth onClick={handleActivate} disabled={state === 'loading'}>Try Again</Button>}
          {(state === 'error' || (!token && state !== 'payment' && state !== 'payment-loading')) && <Button component={RouterLink} to="/resend-activation" variant="outlined" fullWidth>Resend Activation Email</Button>}
          {state === 'success' && <Button component={RouterLink} to="/login" variant="contained" size="large" fullWidth>Continue to Login</Button>}
          {state !== 'success' && <Button component={RouterLink} to="/login" color="inherit">Back to Login</Button>}
        </Stack>
      </Paper>
    </Box>
  );
}

function Detail({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>{label}</Typography>
      <Typography fontWeight={650} color="#142342" sx={{ overflowWrap: 'anywhere' }}>{value || '—'}</Typography>
    </Box>
  );
}
