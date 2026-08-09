import { useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import StatusChip from '../../components/common/StatusChip.jsx';
import workersData from '../../data/workers.json';

export default function AttendancePage() {
  const [state, setState] = useState(Object.fromEntries(workersData.slice(0, 8).map((worker) => [worker.id, 'Present'])));

  return (
    <Box className="page">
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5">Today's attendance</Typography>
          <Typography className="muted">Wednesday, 22 July 2026</Typography>
        </Box>
        <Button variant="contained">Save attendance</Button>
      </Stack>
      <Grid container spacing={2.5}>
        {workersData.slice(0, 8).map((worker) => (
          <Grid key={worker.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Avatar>{worker.name[0]}</Avatar>
                  <Box flex={1}>
                    <b>{worker.name}</b>
                    <Typography className="muted">{worker.role}</Typography>
                  </Box>
                  <StatusChip value={state[worker.id]} />
                </Stack>
                <Stack direction="row" gap={0.7} mt={2} flexWrap="wrap">
                  {['Present', 'Absent', 'Half Day', 'Leave'].map((status) => (
                    <Button
                      key={status}
                      size="small"
                      variant={state[worker.id] === status ? 'contained' : 'outlined'}
                      color={status === 'Absent' ? 'error' : status === 'Half Day' ? 'warning' : 'primary'}
                      onClick={() => setState({ ...state, [worker.id]: status })}
                    >
                      {status}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
