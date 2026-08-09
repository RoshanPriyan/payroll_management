import { Assessment, CalendarMonth, Dashboard, Groups, Paid, Payments, Settings, Wallet } from '@mui/icons-material';

export const menuSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/workers', label: 'Workers', icon: <Groups /> },
      { to: '/attendance', label: 'Attendance', icon: <CalendarMonth /> },
    ],
  },
  {
    label: 'Payroll',
    items: [
      { to: '/daily-payments', label: 'Daily Payments', icon: <Payments /> },
      { to: '/weekly-payments', label: 'Weekly Payments', icon: <Wallet /> },
      { to: '/history', label: 'Payment History', icon: <Paid /> },
      { to: '/reports', label: 'Reports', icon: <Assessment /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: <Settings /> },
    ],
  },
];

export const menuItems = menuSections.flatMap((section) => section.items);
