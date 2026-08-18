import { Box, Button, Drawer, Typography } from '@mui/material';
import { Logout } from '@mui/icons-material';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth/useAuth.js';
import { menuSections } from './menuItems.jsx';

export default function Sidebar({ mobile, open, onClose }) {
  const navigate = useNavigate();
  const auth = useAuth();
  const visibleMenuSections = menuSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.roles || item.roles.includes(auth.role)),
    }))
    .filter((section) => section.items.length > 0);

  const handleLogout = () => {
    auth.logout();
    navigate('/login', { replace: true });
  };

  const nav = (
    <Box className="sideInner">
      <Box className="brand">
        <Box className="brandMark">P</Box>
        <Box>
          <b>payrollly</b>
          <Typography>WORKFORCE OS</Typography>
        </Box>
      </Box>
      <Box component="nav" className="navScroll">
        {visibleMenuSections.map((section) => (
          <Box key={section.label} className="navSection">
            <Typography className="navSectionLabel">{section.label}</Typography>
            {section.items.map((item) => (
              <NavLink onClick={onClose} key={item.to} to={item.to} end className="navLink">
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </Box>
        ))}
      </Box>
      <Box className="sideFoot">
        <Button fullWidth startIcon={<Logout />} color="inherit" onClick={handleLogout}>Logout</Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={mobile ? 'temporary' : 'permanent'}
      open={mobile ? open : true}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: 250, border: 0 } }}
    >
      {nav}
    </Drawer>
  );
}
