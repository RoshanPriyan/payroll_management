import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

export default function StatCard({ icon, title, value, trend, color = '#2f6df6' }) {
  return (
    <Card className="stat">
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography className="muted">{title}</Typography>
            <Typography variant="h5" mt={1}>{value}</Typography>
            <Typography variant="caption" color="success.main">
              <TrendingUp sx={{ fontSize: 14, verticalAlign: 'middle' }} /> {trend}
            </Typography>
          </Box>
          <Box className="statIcon" sx={{ background: color + '18', color }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
