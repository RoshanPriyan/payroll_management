import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Assessment, Payments, Wallet } from '@mui/icons-material';
import StatCard from '../../components/common/StatCard.jsx';
import { primary } from '../../styles/theme.js';

export default function ReportsPage() {
  return (
    <Box className="page">
      <Typography variant="h5">Reports & insights</Typography>
      <Typography className="muted" mb={3}>Your payroll performance at a glance.</Typography>
      <Grid container spacing={2.5}>
        {[
          ['Today’s expense', '₹12,450', <Payments />],
          ['Weekly expense', '₹58,600', <Wallet />],
          ['Monthly expense', '₹1,24,000', <Assessment />],
        ].map((item) => (
          <Grid size={{ xs: 12, md: 4 }} key={item[0]}>
            <StatCard title={item[0]} value={item[1]} icon={item[2]} trend="8% from last period" />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2.5} mt={1}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Salary expense trend</Typography>
              <Box className="lineChart">
                <svg viewBox="0 0 600 200" preserveAspectRatio="none">
                  <polyline points="0,160 70,110 140,135 220,70 300,95 390,40 480,82 600,22" fill="none" stroke={primary} strokeWidth="5" />
                </svg>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Payment modes</Typography>
              <Box className="donut small"><b>100%</b></Box>
              <Stack gap={1}>
                <Typography>● Cash <b style={{ float: 'right' }}>45%</b></Typography>
                <Typography>● Bank transfer <b style={{ float: 'right' }}>35%</b></Typography>
                <Typography>● UPI <b style={{ float: 'right' }}>20%</b></Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
