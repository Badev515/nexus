import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Home from './pages/Home';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: { default: '#f4f6f9' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: `'Inter', 'Roboto', 'Segoe UI', sans-serif`,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { transition: 'box-shadow 0.2s ease, transform 0.2s ease' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { transition: 'transform 0.15s ease' },
      },
    },
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
    </ThemeProvider>
  );
}