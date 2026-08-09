import { Box, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import FormField from '../../components/common/FormField.jsx';

export default function SettingsPage() {
  return (
    <Box className="page formPage">
      <Typography variant="h5">Settings</Typography>
      <Typography className="muted" mb={3}>Control your business and notification preferences.</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6" mb={2}>Owner information</Typography>
          <Grid container spacing={2.5}>
            <FormField label="Owner name" />
            <FormField label="Business name" />
            <Grid size={{ xs: 12 }}>
              <TextField label="Business address" fullWidth multiline rows={2} />
            </Grid>
          </Grid>
          <Typography variant="h6" mt={4} mb={2}>Preferences</Typography>
          <Stack gap={1}>
            <Stack direction="row" justifyContent="space-between" className="setting">
              <Box>
                <b>Dark theme</b>
                <Typography className="muted">Use a dark color scheme</Typography>
              </Box>
              <input type="checkbox" />
            </Stack>
            <Stack direction="row" justifyContent="space-between" className="setting">
              <Box>
                <b>Notifications</b>
                <Typography className="muted">Receive payment reminders</Typography>
              </Box>
              <input type="checkbox" defaultChecked />
            </Stack>
          </Stack>
          <Button variant="contained" sx={{ mt: 3 }}>Save changes</Button>
        </CardContent>
      </Card>
    </Box>
  );
}
