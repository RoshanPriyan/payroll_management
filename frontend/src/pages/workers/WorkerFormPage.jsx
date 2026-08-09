import { useState } from 'react';
import { Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/common/FormField.jsx';

export default function WorkerFormPage({ editing = false }) {
  const nav = useNavigate();
  const [mode, setMode] = useState('Bank Transfer');

  return (
    <Box className="page formPage">
      <Typography variant="h5">{editing ? 'Edit worker' : 'Add a new worker'}</Typography>
      <Typography className="muted" mb={3}>Enter worker details to keep payroll organized.</Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2.5}>
            <FormField label="Full name" />
            <FormField label="Phone number" />
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Address" multiline rows={2} />
            </Grid>
            <FormField label="Salary amount" type="number" />
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Salary type" defaultValue="Daily">
                <MenuItem value="Daily">Daily</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Payment mode" value={mode} onChange={(event) => setMode(event.target.value)}>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </TextField>
            </Grid>
            {mode === 'Bank Transfer' && (
              <>
                <FormField label="Bank name" />
                <FormField label="Account number" />
                <FormField label="IFSC code" />
              </>
            )}
            {mode === 'UPI' && <FormField label="UPI ID" />}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Joining date" type="date" slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Status" defaultValue="Active">
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Stack direction="row" gap={1.5} mt={4}>
            <Button variant="contained" onClick={() => nav('/workers')}>Save worker</Button>
            <Button onClick={() => nav('/workers')}>Cancel</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
