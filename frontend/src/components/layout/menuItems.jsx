import { Assessment, CalendarMonth, Dashboard, Groups, Paid, Payments, Settings } from '@mui/icons-material';
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
      { to: '/payment-details', label: 'Payment Details', icon: <Payments />, roles: [ROLES.ADMIN] },
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
