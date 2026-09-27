import { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import { menuItems } from './menuItems.jsx';

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const mobile = useMediaQuery('(max-width:900px)');
  const location = useLocation();
  const title = menuItems.find((item) => item.to === location.pathname)?.label || 'Payroll';
  const subtitle = {
    '/history': 'Track every salary payment in one place.',
    '/attendance-history': 'View and track worker attendance records',
  }[location.pathname];

  return (
    <Box className="shell">
      <Sidebar mobile={mobile} open={open} onClose={() => setOpen(false)} />
      <Box className="main">
        <Header mobile={mobile} title={title} subtitle={subtitle} onOpenSidebar={() => setOpen(true)} />
        <Outlet />
      </Box>
    </Box>
  );
}
