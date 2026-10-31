import { useRef, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/authService.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const genericSuccess = 'If an account requires activation, an activation email will be sent to the registered email address.';

function getErrorMessage(error) {
  if (!error?.response) return 'Unable to connect to the server. Check your connection and try again.';
  return 'We could not process your request right now. Please try again later.';
}

export default function ResendActivationPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const submitting = useRef(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setStatus('error');
      setMessage('Enter your email address.');
      return;
    }
    if (!emailPattern.test(normalizedEmail)) {
      setStatus('error');
      setMessage('Enter a valid email address.');
      return;
    }
    if (submitting.current) return;

    submitting.current = true;
    setStatus('loading');
    setMessage('');
    try {
      await authService.resendActivationEmail(normalizedEmail, { timeout: 15000 });
      setStatus('success');
      setMessage(genericSuccess);
    } catch (error) {
      setStatus('error');
      setMessage(getErrorMessage(error));
    } finally {
      submitting.current = false;
    }
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(135deg, #f5f8ff 0%, #eaf0ff 100%)' }}>
      <Paper elevation={4} sx={{ width: 'min(100%, 480px)', p: { xs: 3, sm: 5 }, borderRadius: 4 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit} noValidate>
          <Box textAlign="center">
            <Box aria-hidden="true" sx={{ display: 'grid', placeItems: 'center', width: 58, height: 58, mx: 'auto', mb: 2, borderRadius: 2, bgcolor: '#2563eb', color: 'white', fontSize: 25, fontWeight: 800 }}>P</Box>
            <Typography variant="h4" component="h1" fontWeight={800} color="#142342">Resend Activation Email</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Enter the email address you used to register.</Typography>
          </Box>
          {status === 'success' && <Alert severity="success" role="status">{message}</Alert>}
          {status === 'error' && <Alert severity="error" role="alert">{message}</Alert>}
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => { setEmail(event.target.value); if (status !== 'loading') { setStatus('idle'); setMessage(''); } }}
            required
            fullWidth
            disabled={status === 'loading'}
            inputProps={{ 'aria-label': 'Email address' }}
          />
          {status === 'loading' && <Typography role="status" color="text.secondary" textAlign="center">Sending request…</Typography>}
          <Button type="submit" variant="contained" size="large" disabled={status === 'loading'} sx={{ py: 1.25, bgcolor: '#2563eb' }}>
            {status === 'loading' ? 'Please wait…' : 'Resend Activation Email'}
          </Button>
          <Button component={RouterLink} to="/login" color="inherit">Back to Login</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
