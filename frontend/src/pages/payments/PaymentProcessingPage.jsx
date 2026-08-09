import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import StatusChip from '../../components/common/StatusChip.jsx';
import { money } from '../../components/common/formatters.js';
import workersData from '../../data/workers.json';

export default function PaymentProcessingPage({ weekly = false }) {
  const people = workersData.filter((worker) => worker.salaryType === (weekly ? 'Weekly' : 'Daily'));

  return (
    <Box className="page">
      <Typography variant="h5">{weekly ? 'Weekly' : 'Daily'} payment processing</Typography>
      <Typography className="muted" mb={3}>Review and process pending worker payments.</Typography>
      <Grid container spacing={2.5}>
        {people.map((worker) => (
          <Grid key={worker.id} size={{ xs: 12, md: 6, lg: 4 }}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Box>
                    <Typography variant="h6">{worker.name}</Typography>
                    <Typography className="muted">{worker.paymentMode}</Typography>
                  </Box>
                  <StatusChip value="Pending" />
                </Stack>
                <Box className="salary">
                  <Typography className="muted">{weekly ? 'Total weekly salary' : 'Today’s salary'}</Typography>
                  <b>{money(worker.salary)}</b>
                </Box>
                {weekly && <Typography className="muted">Present days: 5 · Absent days: 1</Typography>}
                <Stack direction="row" gap={1} mt={2}>
                  <Button variant="contained">{worker.paymentMode === 'Cash' ? 'Mark paid' : worker.paymentMode === 'UPI' ? 'Pay via UPI' : 'Transfer'}</Button>
                  {weekly && <Button color="error">Reject</Button>}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
