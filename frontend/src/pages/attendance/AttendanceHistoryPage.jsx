import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from '@mui/icons-material';
import { attendanceApi } from '../../api/attendanceApi.js';
import StatusChip from '../../components/common/StatusChip.jsx';
import '../../styles/adminUsers.css';

const PAGE_LIMIT_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Present', value: 'PRESENT' },
  { label: 'Absent', value: 'ABSENT' },
  { label: 'Half Day', value: 'HALF_DAY' },
];

function getApiMessage(apiError, fallback) {
  return (
    apiError.response?.data?.detail
    || apiError.response?.data?.details
    || apiError.response?.data?.message
    || fallback
  );
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

export default function AttendanceHistoryPage() {
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    startDate: '',
    endDate: '',
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
    });
    setPage(1);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  return (
    <Box className="page">
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
              <Typography className="muted" mb={0.75}>Attendance Status</Typography>
              <Select fullWidth size="small" value={filters.status} onChange={(event) => handleFilterChange('status', event.target.value)}>
                {STATUS_OPTIONS.map((option) => <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, md: 4.8 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Stack width="100%" direction="row" justifyContent={{ xs: 'stretch', sm: 'flex-end' }} gap={1}>
                <Button sx={{ minWidth: 120, flex: { xs: 1, sm: 'initial' } }} variant="contained" startIcon={<Search />} onClick={loadAttendanceHistory} disabled={loading}>Search</Button>
                <Button sx={{ minWidth: 96, flex: { xs: 1, sm: 'initial' } }} variant="outlined" color="inherit" onClick={handleReset}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <section className="adminUsersSection attendanceHistorySection">
        <Box className="adminUsersSectionHead">
          <Box>
            <h2>Attendance Records</h2>
          </Box>
          <Box className="attendanceModeGuide">
            <b>Attendance Mode Guide:</b>
            <span><i className="attendanceGuideDot attendanceGuidePresent" />Present</span>
            <span><i className="attendanceGuideDot attendanceGuideLeave" />Absent</span>
            <span><i className="attendanceGuideDot attendanceGuideHalfDay" />Half Day</span>
          </Box>
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
              {!loading && !error && records.map((record) => (
                <tr key={record.id || `${record.date}-${record.username}`}>
                  <td>{formatDateLabel(record.date)}</td>
                  <td><b>{record.username}</b></td>
                  <td><StatusChip value={getStatusLabel(record.status)} /></td>
                  <td className="adminUsersEmail">{record.remarks || '-'}</td>
                </tr>
              ))}
              {!loading && !error && records.length === 0 && (
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
