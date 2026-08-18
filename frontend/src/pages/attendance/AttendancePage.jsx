import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { attendanceApi } from '../../api/attendanceApi.js';
import { workerApi } from '../../api/workerApi.js';
import StatusChip from '../../components/common/StatusChip.jsx';

const ATTENDANCE_STATUSES = [
  { label: 'Present', value: 'PRESENT', color: 'primary' },
  { label: 'Absent', value: 'ABSENT', color: 'error' },
  { label: 'Half Day', value: 'HALF_DAY', color: 'warning' },
  { label: 'Leave', value: 'LEAVE', color: 'primary' },
];

const DEFAULT_STATUS = 'PRESENT';

function getStatusLabel(value) {
  return ATTENDANCE_STATUSES.find((status) => status.value === value)?.label || 'Present';
}

function getTodayDateValue() {
  const now = new Date();
  const offsetDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function getApiMessage(apiError, fallback) {
  return (
    apiError.response?.data?.detail
    || apiError.response?.data?.details
    || apiError.response?.data?.message
    || fallback
  );
}

function getWorkerItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.workers)) return data.data.workers;
  if (Array.isArray(data?.workers)) return data.workers;
  return [];
}

function normalizeWorker(worker, index) {
  const firstName = worker.first_name || worker.firstName || '';
  const lastName = worker.last_name || worker.lastName || '';
  const name = worker.name || [firstName, lastName].filter(Boolean).join(' ') || 'Worker';

  return {
    id: worker.id || worker.worker_id || worker.workerId || index + 1,
    name,
  };
}

const todayLabel = new Intl.DateTimeFormat('en-IN', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
}).format(new Date());

export default function AttendancePage() {
  const [workers, setWorkers] = useState([]);
  const [state, setState] = useState({});
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workerError, setWorkerError] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadWorkers() {
      setLoadingWorkers(true);
      setWorkerError('');

      try {
        const response = await workerApi.getWorkers();
        const items = getWorkerItems(response.data).map(normalizeWorker);

        if (ignore) return;

        setWorkers(items);
        setState((currentState) => ({
          ...Object.fromEntries(items.map((worker) => [worker.id, DEFAULT_STATUS])),
          ...currentState,
        }));
      } catch (apiError) {
        if (ignore) return;

        setWorkers([]);
        setWorkerError(apiError.response?.data?.message || 'Unable to load workers.');
      } finally {
        if (!ignore) setLoadingWorkers(false);
      }
    }

    loadWorkers();

    return () => {
      ignore = true;
    };
  }, []);

  const handleMarkAllPresent = () => {
    setState(Object.fromEntries(workers.map((worker) => [worker.id, 'PRESENT'])));
    setSubmitError('');
    setSuccessMessage('');
  };

  const handleResetAttendance = () => {
    setState(Object.fromEntries(workers.map((worker) => [worker.id, DEFAULT_STATUS])));
    setSubmitError('');
    setSuccessMessage('');
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    setSubmitError('');
    setSuccessMessage('');

    const payload = {
      attendance_date: getTodayDateValue(),
      workers: workers.map((worker) => ({
        worker_id: Number(worker.id),
        attendance_status: state[worker.id] || DEFAULT_STATUS,
      })),
    };

    try {
      const response = await attendanceApi.markAttendance(payload);
      setSuccessMessage(response.data?.details || response.data?.message || 'Attendance marked successfully');
    } catch (apiError) {
      setSubmitError(getApiMessage(apiError, 'Unable to save attendance. Please try again.'));
    } finally {
      setSavingAttendance(false);
    }
  };

  const isAttendanceDisabled = loadingWorkers || savingAttendance || !!workerError || workers.length === 0;

  return (
    <Box className="page">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="h5">Today&apos;s attendance</Typography>
          <Typography className="muted">{todayLabel}</Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button variant="outlined" onClick={handleMarkAllPresent} disabled={isAttendanceDisabled}>Mark all present</Button>
          <Button variant="outlined" color="inherit" onClick={handleResetAttendance} disabled={isAttendanceDisabled}>Reset</Button>
          <Button variant="contained" onClick={handleSaveAttendance} disabled={isAttendanceDisabled}>
            {savingAttendance ? 'Saving...' : 'Save attendance'}
          </Button>
        </Stack>
      </Stack>
      {workerError && <Alert severity="error" sx={{ mb: 2 }}>{workerError}</Alert>}
      {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
      <Grid container spacing={2.5}>
        {loadingWorkers && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography className="muted">Loading workers...</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {!loadingWorkers && !workerError && workers.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography className="muted">No workers found.</Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {!loadingWorkers && !workerError && workers.map((worker) => (
          <Grid key={worker.id} size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Box flex={1}>
                    <b>{worker.name}</b>
                  </Box>
                  <StatusChip value={getStatusLabel(state[worker.id])} />
                </Stack>
                <Stack direction="row" gap={0.7} mt={2} flexWrap="wrap">
                  {ATTENDANCE_STATUSES.map((status) => (
                    <Button
                      key={status.value}
                      size="small"
                      variant={state[worker.id] === status.value ? 'contained' : 'outlined'}
                      color={status.color}
                      onClick={() => {
                        setState({ ...state, [worker.id]: status.value });
                        setSubmitError('');
                        setSuccessMessage('');
                      }}
                    >
                      {status.label}
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
