import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ChevronLeft, ChevronRight, Refresh, Search } from '@mui/icons-material';
import { adminAuditLogApi } from '../../api/adminAuditLogApi.js';
import AdminShell from '../../components/admin/AdminShell.jsx';
import '../../styles/adminUsers.css';

const PAGE_LIMIT_OPTIONS = [10, 25, 50];
const METHOD_OPTIONS = ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_OPTIONS = ['', '200', '201', '204', '400', '401', '403', '404', '422', '500'];
const DEVICE_OPTIONS = ['', 'Desktop', 'Mobile', 'Tablet', 'Bot', 'Unknown'];

const emptyFilters = {
  tenantId: '',
  userId: '',
  method: '',
  endpoint: '',
  statusCode: '',
  ipAddress: '',
  deviceType: '',
  createdAt: '',
};

function getApiMessage(apiError, fallback) {
  return (
    apiError.response?.data?.detail
    || apiError.response?.data?.details
    || apiError.response?.data?.message
    || fallback
  );
}

function getItems(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.logs)) return payload.logs;
  return [];
}

function getPagination(payload, page) {
  return payload?.pagination || payload?.data?.pagination || {
    total_pages: 1,
    previous_page: null,
    current_page: page,
    next_page: null,
  };
}

function normalizeAuditLog(log) {
  return {
    id: log.id || log.audit_log_id || `${log.created_at || log.createdAt}-${log.endpoint}-${log.user_id || log.username}`,
    tenantId: log.tenant_id ?? log.tenantId ?? '',
    userId: log.user_id ?? log.userId ?? '',
    username: log.username || log.user_name || log.email || '',
    method: log.method || log.http_method || '',
    endpoint: log.endpoint || log.path || log.url || '',
    statusCode: log.status_code ?? log.statusCode ?? '',
    ipAddress: log.ip_address || log.ipAddress || '',
    deviceType: log.device_type || log.deviceType || log.device || '',
    createdAt: log.created_at || log.createdAt || '',
  };
}

function formatDateTime(value) {
  if (!value) return '-';

  const parsed = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(statusCode) {
  const code = Number(statusCode);
  if (code >= 200 && code < 300) return 'adminUsersStatusSuccess';
  if (code >= 400 && code < 500) return 'adminUsersStatusWarning';
  if (code >= 500) return 'adminUsersStatusDanger';
  return '';
}

function AdminAuditLogsContent() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
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

  const requestParams = useMemo(() => ({
    page,
    limit,
    tenant_id: filters.tenantId || undefined,
    user_id: filters.userId || undefined,
    username: filters.userId || undefined,
    method: filters.method || undefined,
    endpoint: filters.endpoint || undefined,
    status_code: filters.statusCode || undefined,
    ip_address: filters.ipAddress || undefined,
    device_type: filters.deviceType || undefined,
    created_at: filters.createdAt || undefined,
  }), [filters, limit, page]);

  const loadAuditLogs = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await adminAuditLogApi.getAuditLogs(requestParams);
      const payload = response.data || {};
      setLogs(getItems(payload).map(normalizeAuditLog));
      setPagination(getPagination(payload, page));
    } catch (apiError) {
      setLogs([]);
      setError(getApiMessage(apiError, 'Unable to load audit logs.'));
    } finally {
      setLoading(false);
    }
  }, [page, requestParams]);

  useEffect(() => {
    const timer = window.setTimeout(loadAuditLogs, 0);
    return () => window.clearTimeout(timer);
  }, [loadAuditLogs]);

  const totalPages = Math.max(1, Number(pagination.total_pages || pagination.totalPages || 1));
  const currentPage = Number(pagination.current_page || pagination.currentPage || page);

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const handleLimitChange = (event) => {
    setLimit(Number(event.target.value));
    setPage(1);
  };

  return (
    <>
      <Box className="adminUsersPageHead">
        <Box>
          <h1>Audit Logs</h1>
          <p>Review system activity by tenant, user, method, endpoint, status, IP, device, and created date.</p>
        </Box>
        <Button variant="outlined" startIcon={<Refresh />} onClick={loadAuditLogs} disabled={loading}>
          Refresh
        </Button>
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Tenant ID</Typography>
              <TextField fullWidth size="small" value={filters.tenantId} onChange={(event) => handleFilterChange('tenantId', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>User ID / Username</Typography>
              <TextField fullWidth size="small" value={filters.userId} onChange={(event) => handleFilterChange('userId', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Method</Typography>
              <Select fullWidth size="small" value={filters.method} onChange={(event) => handleFilterChange('method', event.target.value)}>
                {METHOD_OPTIONS.map((option) => <MenuItem key={option || 'all'} value={option}>{option || 'All'}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Endpoint</Typography>
              <TextField fullWidth size="small" value={filters.endpoint} onChange={(event) => handleFilterChange('endpoint', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Status Code</Typography>
              <Select fullWidth size="small" value={filters.statusCode} onChange={(event) => handleFilterChange('statusCode', event.target.value)}>
                {STATUS_OPTIONS.map((option) => <MenuItem key={option || 'all'} value={option}>{option || 'All'}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>IP Address</Typography>
              <TextField fullWidth size="small" value={filters.ipAddress} onChange={(event) => handleFilterChange('ipAddress', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Device Type</Typography>
              <Select fullWidth size="small" value={filters.deviceType} onChange={(event) => handleFilterChange('deviceType', event.target.value)}>
                {DEVICE_OPTIONS.map((option) => <MenuItem key={option || 'all'} value={option}>{option || 'All'}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography className="muted" mb={0.75}>Created At</Typography>
              <TextField fullWidth size="small" type="date" value={filters.createdAt} onChange={(event) => handleFilterChange('createdAt', event.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Stack direction="row" gap={1}>
                <Button sx={{ minWidth: 120 }} variant="contained" startIcon={<Search />} onClick={loadAuditLogs} disabled={loading}>Search</Button>
                <Button sx={{ minWidth: 96 }} variant="outlined" color="inherit" onClick={handleReset}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && <Alert severity="error" className="adminUsersAlert" sx={{ mb: 2 }}>{error}</Alert>}

      <section className="adminUsersSection">
        <Box className="adminUsersSectionHead">
          <Box>
            <h2>Audit Log List</h2>
          </Box>
        </Box>

        <Box className="adminUsersTableWrap">
          <table className="adminUsersTable auditLogsTable">
            <thead>
              <tr>
                <th>Tenant ID</th>
                <th>User ID / Username</th>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Status Code</th>
                <th>IP Address</th>
                <th>Device Type</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8}><Box className="adminUsersState">Loading audit logs...</Box></td>
                </tr>
              )}
              {!loading && !error && logs.map((log) => (
                <tr key={log.id}>
                  <td><span className="adminUsersCode">{log.tenantId || '-'}</span></td>
                  <td>
                    <b>{log.username || log.userId || '-'}</b>
                    {log.username && log.userId ? <div className="adminUsersEmail">{log.userId}</div> : null}
                  </td>
                  <td><span className="workerAdminBadge">{log.method || '-'}</span></td>
                  <td className="adminUsersEmail">{log.endpoint || '-'}</td>
                  <td><span className={`adminUsersStatus ${getStatusClass(log.statusCode)}`}>{log.statusCode || '-'}</span></td>
                  <td>{log.ipAddress || '-'}</td>
                  <td>{log.deviceType || '-'}</td>
                  <td>{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
              {!loading && !error && logs.length === 0 && (
                <tr>
                  <td colSpan={8}><Box className="adminUsersState">No audit logs found.</Box></td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8}><Box className="adminUsersState">Audit logs could not be loaded.</Box></td>
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
                <IconButton size="small" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={loading || !(pagination.previous_page || pagination.previousPage)}>
                  <ChevronLeft fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Next page">
              <span>
                <IconButton size="small" onClick={() => setPage((current) => current + 1)} disabled={loading || !(pagination.next_page || pagination.nextPage)}>
                  <ChevronRight fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </section>
    </>
  );
}

export default function AdminAuditLogsPage() {
  return (
    <AdminShell title="Audit Logs">
      <AdminAuditLogsContent />
    </AdminShell>
  );
}
