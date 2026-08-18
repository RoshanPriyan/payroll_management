import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <Stack minHeight="100vh" alignItems="center" justifyContent="center" spacing={2} sx={{ px: 3, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight={800}>Unauthorized</Typography>
      <Typography color="text.secondary" maxWidth={460}>
        You do not have permission to access this page.
      </Typography>
      <Button component={RouterLink} to="/login" variant="contained">
        Go to Login
      </Button>
    </Stack>
  );
}
