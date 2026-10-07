import { useCallback, useEffect, useState } from 'react';
import {
  Add,
  Refresh,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
} from '@mui/material';
import { adminUserApi } from '../../api/adminUserApi.js';
import AdminShell from '../../components/admin/AdminShell.jsx';
import '../../styles/landing.css';
import '../../styles/adminUsers.css';

function formatDate(value) {
  if (!value) return '-';

  const parsed = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeStatus(status) {
  return String(status || 'Active').trim();
}

function getApiMessage(data, fallback) {
  return data?.message || data?.details || data?.detail || fallback;
}

function getApiErrorMessage(apiError, fallback) {
  return getApiMessage(apiError.response?.data, fallback);
}

function isUserActive(user) {
  if (typeof user.is_active === 'boolean') {
    return user.is_active;
  }

  return normalizeStatus(user.status).toLowerCase() !== 'inactive';
}

const emptyRegisterForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirm_password: '',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [timestamp, setTimestamp] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [statusUpdatingUserId, setStatusUpdatingUserId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminUserApi.getUsers();
      const payload = response.data || {};
      setUsers(Array.isArray(payload.data) ? payload.data : []);
      setTimestamp(payload.timestamp || '');
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load super admin users.'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    if (!error) return undefined;

    const timer = window.setTimeout(() => setError(''), 3000);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = window.setTimeout(() => setSuccessMessage(''), 3000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!registerError) return undefined;

    const timer = window.setTimeout(() => setRegisterError(''), 3000);
    return () => window.clearTimeout(timer);
  }, [registerError]);

  useEffect(() => {
    if (!registerSuccess) return undefined;

    const timer = window.setTimeout(() => setRegisterSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [registerSuccess]);

  const handleOpenRegister = () => {
    setRegisterForm(emptyRegisterForm);
    setRegisterError('');
    setRegisterSuccess('');
    setRegisterOpen(true);
  };

  const handleCloseRegister = () => {
    if (savingUser) return;

    setRegisterOpen(false);
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handleRegisterChange = (event) => {
    const { name, value } = event.target;
    setRegisterForm((current) => ({ ...current, [name]: value }));
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      first_name: registerForm.first_name.trim(),
      last_name: registerForm.last_name.trim() || null,
      email: registerForm.email.trim(),
      password: registerForm.password,
      confirm_password: registerForm.confirm_password,
    };

    if (!payload.first_name || !payload.email || !payload.password || !payload.confirm_password) {
      setRegisterError('First name, email, password, and confirm password are required.');
      setRegisterSuccess('');
      return;
    }

    if (payload.password !== payload.confirm_password) {
      setRegisterError('Password and confirm password do not match');
      setRegisterSuccess('');
      return;
    }

    setSavingUser(true);
    setRegisterError('');
    setRegisterSuccess('');
    setSuccessMessage('');

    try {
      const response = await adminUserApi.registerUser(payload);
      const message = getApiMessage(response.data, 'Admin user registered successfully');

      setRegisterSuccess(message);
      setSuccessMessage(message);
      setRegisterForm(emptyRegisterForm);
      setRegisterOpen(false);
      await loadUsers();
    } catch (apiError) {
      setRegisterError(getApiErrorMessage(apiError, 'Unable to register admin user.'));
    } finally {
      setSavingUser(false);
    }
  };

  const handleStatusToggle = async (user) => {
    const nextActive = !isUserActive(user);

    setStatusUpdatingUserId(user.id);
    setError('');
    setSuccessMessage('');

    try {
      const response = await adminUserApi.updateStatus({
        user_id: user.id,
        is_active: nextActive,
      });
      const message = getApiMessage(response.data, `User ${nextActive ? 'activated' : 'deactivated'} successfully`);

      setSuccessMessage(message);
      setUsers((currentUsers) => currentUsers.map((item) => (
        item.id === user.id
          ? { ...item, is_active: nextActive, status: nextActive ? 'Active' : 'Inactive' }
          : item
      )));
      await loadUsers();
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update user status.'));
    } finally {
      setStatusUpdatingUserId(null);
    }
  };

  return (
    <AdminShell title="Super Admin Users">
          <Box className="adminUsersPageHead">
            <Box>
              <h1>Super Admin Users</h1>
              <p>{users.length.toLocaleString('en-IN')} super admin {users.length === 1 ? 'user' : 'users'} using the application{timestamp ? ` - Updated ${timestamp}` : ''}</p>
            </Box>
            <Stack direction="row" gap={1.25} flexWrap="wrap">
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadUsers} disabled={loading}>
                Refresh
              </Button>
              <Button variant="contained" startIcon={<Add />} onClick={handleOpenRegister}>
                Add User
              </Button>
            </Stack>
          </Box>

          <section className="adminUsersSection">
            <Box className="adminUsersSectionHead">
              <Box>
                <h2>User List</h2>
              </Box>
            </Box>

            {error && <Alert severity="error" className="adminUsersAlert">{error}</Alert>}
            {successMessage && <Alert severity="success" className="adminUsersAlert">{successMessage}</Alert>}

            <Box className="adminUsersTableWrap">
              <table className="adminUsersTable">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>On / Off</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8}>
                        <Box className="adminUsersState"><CircularProgress size={18} /> Loading super admin users...</Box>
                      </td>
                    </tr>
                  )}
                  {!loading && !error && users.length === 0 && (
                    <tr>
                      <td colSpan={8}><Box className="adminUsersState">No super admin users found.</Box></td>
                    </tr>
                  )}
                  {!loading && !error && users.map((user) => {
                    const status = normalizeStatus(user.status);
                    const active = isUserActive(user);
                    const updatingStatus = statusUpdatingUserId === user.id;
                    return (
                      <tr key={user.id}>
                        <td><span className="adminUsersCode">ADM-{user.id}</span></td>
                        <td><b>{user.first_name || '-'}</b></td>
                        <td>{user.last_name || '-'}</td>
                        <td className="adminUsersEmail">{user.email || '-'}</td>
                        <td><span className={`adminUsersStatus adminUsersStatus${status}`}>{status}</span></td>
                        <td>
                          <Box className="adminUsersStatusControl">
                            <Switch
                              checked={active}
                              onChange={() => handleStatusToggle(user)}
                              disabled={updatingStatus}
                              size="small"
                              inputProps={{ 'aria-label': `${active ? 'Deactivate' : 'Activate'} ${user.email || 'user'}` }}
                            />
                            <span>{updatingStatus ? 'Saving...' : active ? 'On' : 'Off'}</span>
                          </Box>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>{formatDate(user.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Box>
          </section>

      {registerOpen && (
        <div className="landing-page adminUsersRegisterModalLayer">
          <div className="auth-backdrop adminUsersRegisterBackdrop" role="presentation" onMouseDown={handleCloseRegister}>
            <div className="auth-dialog modal-content-custom" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
              <div className="modal-header-custom auth-header">
                <h5>
                  <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                  Add Super Admin User
                </h5>
                <button type="button" className="auth-close" aria-label="Close modal" onClick={handleCloseRegister} disabled={savingUser}>
                  &times;
                </button>
              </div>

              <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
                <div className="auth-grid">
                  <label>
                    <span>First Name</span>
                    <input
                      name="first_name"
                      type="text"
                      placeholder="John"
                      className="form-control-custom"
                      value={registerForm.first_name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Last Name</span>
                    <input
                      name="last_name"
                      type="text"
                      placeholder="Doe"
                      className="form-control-custom"
                      value={registerForm.last_name}
                      onChange={handleRegisterChange}
                    />
                  </label>
                  <label className="adminUsersAuthWide">
                    <span>Email</span>
                    <input
                      name="email"
                      type="email"
                      placeholder="admin@company.com"
                      className="form-control-custom"
                      value={registerForm.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Password</span>
                    <input
                      name="password"
                      type="password"
                      placeholder="********"
                      className="form-control-custom"
                      value={registerForm.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                  <label>
                    <span>Confirm Password</span>
                    <input
                      name="confirm_password"
                      type="password"
                      placeholder="********"
                      className="form-control-custom"
                      value={registerForm.confirm_password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </label>
                </div>

                {registerError && <p className="auth-error" role="alert">{registerError}</p>}
                {registerSuccess && <p className="auth-success" role="alert">{registerSuccess}</p>}

                <button className="btn-gradient auth-submit" type="submit" disabled={savingUser}>
                  {savingUser ? 'Please wait...' : 'Add User'}
                </button>
                <p className="auth-switch">
                  <button type="button" onClick={handleCloseRegister} disabled={savingUser}>
                    Cancel
                  </button>
                </p>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
