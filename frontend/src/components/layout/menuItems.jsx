import { Assessment, CalendarMonth, Dashboard, Groups, Paid, Payments, Settings, Wallet } from '@mui/icons-material';
import { ROLES } from '../../services/auth/authSession.js';

export const menuSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <Dashboard />, roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/workers', label: 'Workers', icon: <Groups />, roles: [ROLES.ADMIN] },
      { to: '/attendance', label: 'Attendance', icon: <CalendarMonth />, roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { to: '/daily-payments', label: 'Daily Payments', icon: <Payments />, roles: [ROLES.ADMIN] },
      { to: '/weekly-payments', label: 'Weekly Payments', icon: <Wallet />, roles: [ROLES.ADMIN] },
      { to: '/history', label: 'Payment History', icon: <Paid />, roles: [ROLES.ADMIN] },
      { to: '/reports', label: 'Reports', icon: <Assessment />, roles: [ROLES.ADMIN] },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: <Settings />, roles: [ROLES.ADMIN] },
    ],
  },
];

export const menuItems = menuSections.flatMap((section) => section.items);
