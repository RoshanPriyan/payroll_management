import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  Download,
  EventAvailable,
  Groups,
  Refresh,
  Search,
  WorkOff,
} from '@mui/icons-material';
import { attendanceApi } from '../../api/attendanceApi.js';
import { workerApi } from '../../api/workerApi.js';
import StatCard from '../../components/common/StatCard.jsx';
import StatusChip from '../../components/common/StatusChip.jsx';
import '../../styles/adminUsers.css';

const PAGE_LIMIT_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Present', value: 'PRESENT' },
  { label: 'Leave', value: 'LEAVE' },
];

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
  const name = worker.name || worker.username || [firstName, lastName].filter(Boolean).join(' ') || 'Worker';

  return {
    id: worker.id || worker.worker_id || worker.workerId || index + 1,
    name,
  };
}

function normalizeAttendanceRecord(record) {
  return {
    id: record.id,
    date: record.attendance_date || '',
    status: record.attendance_status || '',
    remarks: record.remarks || '',
    username: record.username || record.worker_name || 'Worker',
  };
}

function formatDateLabel(value) {
  if (!value) return '-';

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getStatusLabel(status) {
  const normalizedStatus = String(status || '').replace(/_/g, ' ').toLowerCase();
  if (!normalizedStatus) return '-';
  return normalizedStatus.replace(/\b\w/g, (char) => char.toUpperCase());
}

function downloadCsv(records) {
  const rows = [
    ['Date', 'Worker Name', 'Status', 'Remarks'],
    ...records.map((record) => [
      record.date,
      record.username,
      getStatusLabel(record.status),
      record.remarks || '-',
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'attendance-history.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
    workerName: '',
    search: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({
    total_pages: 1,
    previous_page: null,
    current_page: 1,
    next_page: null,
  });
  const [loading, setLoading] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [error, setError] = useState('');

  const loadAttendanceHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    const payload = {
      page,
      limit,
      status: filters.status || null,
      start_date: filters.startDate || null,
      end_date: filters.endDate || null,
    };

    console.groupCollapsed('Attendance history API request');
    console.log('Current filter state:', filters);
    console.log('Request payload:', payload);
    console.groupEnd();

    try {
      const response = await attendanceApi.getAttendanceHistory(payload);
      const items = Array.isArray(response.data?.data) ? response.data.data.map(normalizeAttendanceRecord) : [];

      console.groupCollapsed('Attendance history API response');
      console.log('Response data:', response.data);
      console.groupEnd();

      setRecords(items);
      setPagination(response.data?.pagination || {
        total_pages: 1,
        previous_page: null,
        current_page: page,
        next_page: null,
      });
    } catch (apiError) {
      console.groupCollapsed('Attendance history API error');
      console.log('Request payload:', payload);
      console.log('Error response:', apiError.response?.data || apiError.message);
      console.log('Full error:', apiError);
      console.groupEnd();

      setRecords([]);
      setError(getApiMessage(apiError, 'Unable to load attendance history.'));
    } finally {
      setLoading(false);
    }
  }, [filters, limit, page]);

  useEffect(() => {
    const timer = window.setTimeout(loadAttendanceHistory, 0);
    return () => window.clearTimeout(timer);
  }, [loadAttendanceHistory]);

  useEffect(() => {
    let ignore = false;

    async function loadWorkers() {
      setLoadingWorkers(true);

      try {
        const response = await workerApi.getWorkers();
        if (!ignore) setWorkers(getWorkerItems(response.data).map(normalizeWorker));
      } catch {
        if (!ignore) setWorkers([]);
      } finally {
        if (!ignore) setLoadingWorkers(false);
      }
    }

    const timer = window.setTimeout(loadWorkers, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, []);

  const filteredRecords = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const workerName = filters.workerName.trim().toLowerCase();

    return records.filter((record) => {
      const matchesWorker = !workerName || record.username.toLowerCase() === workerName;
      const matchesSearch = !search || `${record.username} ${record.remarks || ''}`.toLowerCase().includes(search);

      return matchesWorker && matchesSearch;
    });
  }, [filters.search, filters.workerName, records]);

  const summary = useMemo(() => {
    const presentDays = records.filter((record) => record.status === 'PRESENT').length;
    const leaveDays = records.filter((record) => record.status === 'LEAVE').length;
    const uniqueWorkers = new Set(records.map((record) => record.username)).size;
    const attendanceRate = records.length ? Math.round((presentDays / records.length) * 100) : 0;

    return {
      presentDays,
      leaveDays,
      uniqueWorkers,
      attendanceRate,
    };
  }, [records]);

  const totalPages = Math.max(1, Number(pagination.total_pages || 1));
  const currentPage = Number(pagination.current_page || page);

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
    if (['status', 'startDate', 'endDate'].includes(key)) setPage(1);
  };

  const handleReset = () => {
    setFilters({
      status: '',
      startDate: '',
      endDate: '',
      workerName: '',
      search: '',
    });
    setPage(1);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  return (
    <Box className="page">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2} mb={2}>
        <Box>
          <Typography variant="h5">Attendance History</Typography>
          <Typography className="muted">View and track worker attendance records</Typography>
        </Box>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Download />} onClick={() => downloadCsv(filteredRecords)} disabled={filteredRecords.length === 0}>
            Export CSV
          </Button>
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadAttendanceHistory} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>From Date</Typography>
              <TextField fullWidth size="small" type="date" value={filters.startDate} onChange={(event) => handleFilterChange('startDate', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>To Date</Typography>
              <TextField fullWidth size="small" type="date" value={filters.endDate} onChange={(event) => handleFilterChange('endDate', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>Worker</Typography>
              <Select fullWidth size="small" value={filters.workerName} onChange={(event) => handleFilterChange('workerName', event.target.value)} disabled={loadingWorkers}>
                <MenuItem value="">All Workers</MenuItem>
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.name}>{worker.name}</MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>Attendance Status</Typography>
              <Select fullWidth size="small" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>
                {STATUS_OPTIONS.map((option) => <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>&nbsp;</Typography>
              <Stack direction="row" gap={1}>
                <Button fullWidth variant="contained" startIcon={<Search />} onClick={loadAttendanceHistory} disabled={loading}>Search</Button>
                <Button variant="outlined" color="inherit" onClick={handleReset}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<Groups />} title="Workers on Page" value={summary.uniqueWorkers} color="#2563eb" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<EventAvailable />} title="Present Days" value={summary.presentDays} color="#16a34a" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<WorkOff />} title="Leave Days" value={summary.leaveDays} color="#dc2626" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard icon={<CalendarMonth />} title="Attendance Rate" value={`${summary.attendanceRate}%`} color="#7c3aed" />
        </Grid>
      </Grid>

      <section className="adminUsersSection">
        <Box className="adminUsersSectionHead">
          <Box>
            <h2>Attendance Records</h2>
          </Box>
          <TextField
            size="small"
            placeholder="Search worker name"
            value={filters.search}
            onChange={(event) => handleFilterChange('search', event.target.value)}
            sx={{ width: { xs: '100%', sm: 280 } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }}
          />
        </Box>

        <Box className="adminUsersTableWrap">
          <table className="adminUsersTable attendanceHistoryTable">
            <thead>
              <tr>
                <th>Date</th>
                <th>Worker Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}><Box className="adminUsersState">Loading attendance history...</Box></td>
                </tr>
              )}
              {!loading && !error && filteredRecords.map((record) => (
                <tr key={record.id || `${record.date}-${record.username}`}>
                  <td>{formatDateLabel(record.date)}</td>
                  <td><b>{record.username}</b></td>
                  <td><StatusChip value={getStatusLabel(record.status)} /></td>
                  <td className="adminUsersEmail">{record.remarks || '-'}</td>
                </tr>
              ))}
              {!loading && !error && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={4}><Box className="adminUsersState">No attendance records found.</Box></td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4}><Box className="adminUsersState">Attendance history could not be loaded.</Box></td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} justifyContent="space-between" gap={2} sx={{ p: 2, borderTop: '1px solid rgba(15,23,42,.08)' }}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography className="muted">Rows per page:</Typography>
            <Select size="small" value={limit} onChange={handleLimitChange}>
              {PAGE_LIMIT_OPTIONS.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <Typography className="muted">Page {currentPage} of {totalPages}</Typography>
            <Tooltip title="Previous page">
              <span>
                <IconButton size="small" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || !pagination.previous_page}>
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next page">
              <span>
                <IconButton size="small" onClick={() => setPage((current) => current + 1)} disabled={loading || !pagination.next_page}>
                  <ChevronRight fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </section>
    </Box>
  );
}
