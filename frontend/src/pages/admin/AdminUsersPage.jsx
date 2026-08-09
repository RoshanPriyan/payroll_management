import { useEffect, useMemo, useState } from 'react';
import {
  Add,
  Assessment,
  BarChart,
  Business,
  CreditCard,
  Dashboard,
  Groups,
  Logout,
  Refresh,
  Settings,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { adminUserApi } from '../../api/adminUserApi.js';
import { adminAuthService } from '../../services/adminAuthService.js';
import '../../styles/landing.css';
import '../../styles/adminUsers.css';

const navSections = [
  {
    label: 'Overview',
    items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: <Dashboard /> }],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/dashboard#tenants', label: 'Tenants', icon: <Business /> },
      { to: '/admin/dashboard#businesses', label: 'Businesses', icon: <Business /> },
      { to: '/admin/users', label: 'Users', icon: <Groups /> },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { to: '/admin/dashboard#subscriptions', label: 'Subscriptions', icon: <CreditCard /> },
      { to: '/admin/dashboard#revenue', label: 'Revenue', icon: <BarChart /> },
      { to: '/admin/dashboard#reports', label: 'Reports', icon: <Assessment /> },
    ],
  },
  {
    label: 'System',
    items: [{ to: '/admin/dashboard#settings', label: 'Settings', icon: <Settings /> }],
  },
];

function getStoredAdminName() {
  const firstName = localStorage.getItem('first_name') || '';
  const lastName = localStorage.getItem('last_name') || '';
  return [firstName, lastName].filter(Boolean).join(' ') || 'Super Admin';
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'SA';
}

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
  const navigate = useNavigate();
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
  const adminName = useMemo(() => getStoredAdminName(), []);
  const initials = useMemo(() => getInitials(adminName), [adminName]);

  const loadUsers = async () => {
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
  };

  useEffect(() => {
    loadUsers();
  }, []);

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

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login', { replace: true });
  };

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
    <Box className="adminUsersShell">
      <aside className="adminUsersSidebar">
        <Box className="adminUsersBrand">
          <Box className="adminUsersBrandMark">P</Box>
          <Box>
            <b>payrollly</b>
            <Typography>WORKFORCE OS</Typography>
          </Box>
        </Box>

        <nav className="adminUsersNav">
          {navSections.map((section) => (
            <Box key={section.label}>
              <Typography className="adminUsersNavLabel">{section.label}</Typography>
              {section.items.map((item) => (
                <NavLink key={item.label} to={item.to} className="adminUsersNavLink">
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </Box>
          ))}
        </nav>

        <Box className="adminUsersSidebarFoot">
          <Button fullWidth startIcon={<Logout />} color="inherit" onClick={handleLogout}>Logout</Button>
        </Box>
      </aside>

      <Box className="adminUsersMain">
        <header className="adminUsersTopbar">
          <Typography className="adminUsersTitle">Super Admin Users</Typography>
          <Box className="adminUsersProfileChip">
            <Avatar className="adminUsersAvatar">{initials}</Avatar>
            <Box className="adminUsersProfileMeta">
              <div className="adminUsersProfileName">{adminName}</div>
              <div className="adminUsersProfileRole">Super Admin</div>
            </Box>
          </Box>
        </header>

        <main className="adminUsersContent">
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
        </main>
      </Box>

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
    </Box>
  );
}
