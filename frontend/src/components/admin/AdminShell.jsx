import {
  Assessment,
  BarChart,
  Business,
  CreditCard,
  Dashboard,
  Groups,
  History,
  Logout,
  Settings,
} from '@mui/icons-material';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';
import { adminAuthService } from '../../services/adminAuthService.js';

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
    items: [
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: <History /> },
      { to: '/admin/dashboard#settings', label: 'Settings', icon: <Settings /> },
    ],
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

export default function AdminShell({ title, children }) {
  const navigate = useNavigate();
  const adminName = getStoredAdminName();
  const initials = getInitials(adminName);

  const handleLogout = () => {
    adminAuthService.logout();
    navigate('/admin/login', { replace: true });
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
          <Typography className="adminUsersTitle">{title}</Typography>
          <Box className="adminUsersProfileChip">
            <Avatar className="adminUsersAvatar">{initials}</Avatar>
            <Box className="adminUsersProfileMeta">
              <div className="adminUsersProfileName">{adminName}</div>
              <div className="adminUsersProfileRole">Super Admin</div>
            </Box>
          </Box>
        </header>

        <main className="adminUsersContent">
          {children}
        </main>
      </Box>
    </Box>
  );
}
