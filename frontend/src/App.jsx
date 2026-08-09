import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import AppRoutes from './routes/AppRoutes.jsx';
import { theme } from './styles/theme.js';
import './App.css';
import './dashboard.css';
import './styles/adminLogin.css';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
