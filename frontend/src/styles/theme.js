import { createTheme } from '@mui/material';

export const primary = '#2f6df6';

export const theme = createTheme({
  palette: { primary: { main: primary }, background: { default: '#f6f8fc' } },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 800 },
  },
  shape: { borderRadius: 14 },
});
