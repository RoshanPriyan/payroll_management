import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline, Edit, Search, Visibility } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { workerApi } from '../../api/workerApi.js';
import { money } from '../../components/common/formatters.js';
import '../../styles/adminUsers.css';

const salaryTypeLabels = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const paymentModeLabels = {
  CASH: 'Cash',
  BANK: 'Bank Transfer',
  UPI: 'UPI',
};

const genderLabels = {
  MALE: 'Male',
  FEMALE: 'Female',
};

function getGenderLabel(value) {
  if (!value) return '-';
  const normalizedValue = String(value).trim().toUpperCase();
  return genderLabels[normalizedValue] || value;
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
  const salaryType = worker.salaryType || salaryTypeLabels[worker.salary_type] || worker.salary_type || 'Daily';
  const paymentMode = worker.paymentMode || paymentModeLabels[worker.payment_mode] || worker.payment_mode || 'Cash';
  const status = worker.status || (worker.is_active === false ? 'Inactive' : 'Active');

  return {
    id: worker.id || worker.worker_id || worker.workerId || index + 1,
    raw: worker,
    first_name: firstName,
    last_name: lastName,
    name,
    email: worker.email || '-',
    phone: worker.phone || worker.phone_number || '-',
    gender: worker.gender || '',
    salary: worker.salary || worker.salary_amount || 0,
    salary_type: worker.salary_type || worker.salaryType,
    salary_amount: worker.salary_amount || worker.salary || '',
    payment_mode: worker.payment_mode || worker.paymentMode,
    bank_name: worker.bank_name || '',
    account_number: worker.account_number || '',
    ifsc_code: worker.ifsc_code || '',
    upi_id: worker.upi_id || '',
    joining_date: worker.joining_date || '',
    salaryType,
    paymentMode,
    status: String(status).toLowerCase() === 'active' ? 'Active' : String(status).toLowerCase() === 'inactive' ? 'Inactive' : status,
  };
}

function getWorkerFromResponse(data) {
  return data?.data || data?.worker || data || {};
}

function getDetailValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

function getWorkerInitials(name) {
  return String(name || 'Worker')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function WorkerListPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [confirm, setConfirm] = useState(null);
  const [workerItems, setWorkerItems] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);
  const [workerError, setWorkerError] = useState('');
  const [viewWorker, setViewWorker] = useState(null);
  const [loadingViewWorker, setLoadingViewWorker] = useState(false);
  const [viewWorkerError, setViewWorkerError] = useState('');
  const [deletingWorker, setDeletingWorker] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const nav = useNavigate();
  const location = useLocation();
  const workerCreatedMessage = location.state?.workerCreatedMessage || '';
  const shouldRefreshWorkers = Boolean(location.state?.refreshWorkers);
  const [successMessage, setSuccessMessage] = useState(() => workerCreatedMessage);
  const workers = useMemo(
    () => workerItems.filter((worker) => (
      (type === 'All' || worker.salaryType === type)
      && `${worker.name} ${worker.email} ${worker.phone}`.toLowerCase().includes(query.toLowerCase())
    )),
    [query, type, workerItems],
  );

  const loadWorkers = useCallback(async () => {
    setLoadingWorkers(true);
    setWorkerError('');

    try {
      const search = query.trim();
      const response = await workerApi.getWorkers(search ? { search } : undefined);
      const items = getWorkerItems(response.data).map(normalizeWorker);

      setWorkerItems(items);
    } catch (apiError) {
      setWorkerItems([]);
      setWorkerError(apiError.response?.data?.message || 'Unable to load workers.');
    } finally {
      setLoadingWorkers(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(loadWorkers, 300);
    return () => window.clearTimeout(timer);
  }, [loadWorkers]);

  useEffect(() => {
    if (!workerCreatedMessage && !shouldRefreshWorkers) return undefined;

    const timer = window.setTimeout(() => {
      if (workerCreatedMessage) {
        setSuccessMessage(workerCreatedMessage);
      }
      if (shouldRefreshWorkers) {
        loadWorkers();
      }
      nav(location.pathname, { replace: true, state: {} });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadWorkers, location.pathname, nav, shouldRefreshWorkers, workerCreatedMessage]);

  const handleViewWorker = async (worker) => {
    setViewWorker(worker);
    setLoadingViewWorker(true);
    setViewWorkerError('');

    try {
      const response = await workerApi.getWorkerById(worker.id);
      setViewWorker(normalizeWorker(getWorkerFromResponse(response.data), 0));
    } catch (apiError) {
      setViewWorkerError(apiError.response?.data?.message || 'Unable to load worker details.');
    } finally {
      setLoadingViewWorker(false);
    }
  };

  const handleOpenDeleteWorker = (worker) => {
    setDeleteError('');
    setConfirm(worker);
  };

  const handleDeleteWorker = async () => {
    if (!confirm?.id) return;

    setDeletingWorker(true);
    setDeleteError('');

    try {
      await workerApi.deleteWorker(confirm.id);
      setWorkerItems((items) => items.filter((worker) => String(worker.id) !== String(confirm.id)));
      setSuccessMessage(`${confirm.name} removed successfully.`);
      setConfirm(null);
    } catch (apiError) {
      setDeleteError(apiError.response?.data?.message || 'Unable to delete worker. Please try again.');
    } finally {
      setDeletingWorker(false);
    }
  };

  return (
    <Box className="page">
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Stack className="toolrow" direction={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField fullWidth placeholder="Search workers by name, email, or phone..." value={query} onChange={(event) => setQuery(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
        <Select value={type} onChange={(event) => setType(event.target.value)} sx={{ minWidth: 150 }}>
          {['All', 'Daily', 'Weekly', 'Monthly'].map((item) => <MenuItem key={item} value={item}>{item} salary</MenuItem>)}
        </Select>
      </Stack>
      <section className="adminUsersSection workerListSection">
        <Box className="adminUsersSectionHead">
          <Box>
            <h2>Worker List</h2>
          </Box>
          <Button onClick={() => nav('/workers/add')} variant="contained" startIcon={<Add />}>Add Worker</Button>
        </Box>

        <Box className="adminUsersTableWrap">
          <table className="adminUsersTable workerAdminTable">
            <thead>
              <tr>
                <th>Worker ID</th>
                <th>Worker</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Salary Type</th>
                <th>Payment Mode</th>
                <th>Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingWorkers && (
                <tr>
                  <td colSpan={10}><Box className="adminUsersState">Loading workers...</Box></td>
                </tr>
              )}
              {!loadingWorkers && workerError && (
                <tr>
                  <td colSpan={10}><Box className="adminUsersState">{workerError}</Box></td>
                </tr>
              )}
              {!loadingWorkers && !workerError && workers.map((worker) => (
                <tr key={worker.id}>
                  <td><span className="adminUsersCode">WRK-{worker.id}</span></td>
                  <td><b>{worker.name}</b></td>
                  <td className="adminUsersEmail">{worker.email}</td>
                  <td className="adminUsersEmail">{worker.phone}</td>
                  <td>{getGenderLabel(worker.gender)}</td>
                  <td><span className="workerAdminBadge">{worker.salaryType}</span></td>
                  <td>{worker.paymentMode}</td>
                  <td><b>{money(worker.salary)}</b></td>
                  <td><span className={`adminUsersStatus adminUsersStatus${worker.status}`}>{worker.status}</span></td>
                  <td>
                    <Box className="workerAdminActions">
                      <Tooltip title="View worker">
                        <IconButton size="small" aria-label={`View ${worker.name}`} onClick={() => handleViewWorker(worker)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit worker">
                        <IconButton size="small" aria-label={`Edit ${worker.name}`} onClick={() => nav('/workers/edit/' + worker.id, { state: { worker } })}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete worker">
                        <IconButton size="small" color="error" aria-label={`Delete ${worker.name}`} onClick={() => handleOpenDeleteWorker(worker)}>
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </td>
                </tr>
              ))}
              {!loadingWorkers && !workerError && workers.length === 0 && (
                <tr>
                  <td colSpan={10}><Box className="adminUsersState">No workers found.</Box></td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
      </section>
      <Dialog open={!!confirm} onClose={() => !deletingWorker && setConfirm(null)}>
        <DialogTitle>Delete worker?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>Remove {confirm?.name} from this workspace?</Typography>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={deletingWorker}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteWorker} disabled={deletingWorker}>
            {deletingWorker ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!viewWorker} onClose={() => !loadingViewWorker && setViewWorker(null)} fullWidth maxWidth="sm" className="workerDetailsDialog">
        <DialogTitle className="workerDetailsTitle">Worker details</DialogTitle>
        <DialogContent className="workerDetailsContent">
          {loadingViewWorker && <Box className="adminUsersState">Loading worker details...</Box>}
          {!loadingViewWorker && viewWorkerError && <Alert severity="error">{viewWorkerError}</Alert>}
          {!loadingViewWorker && !viewWorkerError && viewWorker && (
            <Stack spacing={2.25}>
              <Box className="workerDetailsHero">
                <Box className="workerDetailsAvatar">{getWorkerInitials(viewWorker.name)}</Box>
                <Box>
                  <Typography variant="h6">{viewWorker.name}</Typography>
                  <Typography>WRK-{viewWorker.id}</Typography>
                </Box>
                <span className={`workerDetailsStatus workerDetailsStatus${viewWorker.status}`}>{getDetailValue(viewWorker.status)}</span>
              </Box>
              <Box className="workerDetailsGrid">
                <Box className="workerDetailsItem"><span>Phone</span><b>{getDetailValue(viewWorker.phone)}</b></Box>
                <Box className="workerDetailsItem"><span>Email</span><b>{getDetailValue(viewWorker.email)}</b></Box>
                <Box className="workerDetailsItem"><span>Gender</span><b>{getGenderLabel(viewWorker.gender)}</b></Box>
                <Box className="workerDetailsItem"><span>Joining date</span><b>{getDetailValue(viewWorker.joining_date)}</b></Box>
                <Box className="workerDetailsItem"><span>Salary type</span><b>{getDetailValue(viewWorker.salaryType)}</b></Box>
                <Box className="workerDetailsItem"><span>Salary amount</span><b>{money(viewWorker.salary)}</b></Box>
                <Box className="workerDetailsItem"><span>Payment mode</span><b>{getDetailValue(viewWorker.paymentMode)}</b></Box>
                <Box className="workerDetailsItem"><span>Bank name</span><b>{getDetailValue(viewWorker.bank_name)}</b></Box>
                <Box className="workerDetailsItem"><span>Account number</span><b>{getDetailValue(viewWorker.account_number)}</b></Box>
                <Box className="workerDetailsItem"><span>IFSC code</span><b>{getDetailValue(viewWorker.ifsc_code)}</b></Box>
                <Box className="workerDetailsItem"><span>UPI ID</span><b>{getDetailValue(viewWorker.upi_id)}</b></Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions className="workerDetailsActions">
          <Button onClick={() => setViewWorker(null)} disabled={loadingViewWorker}>Close</Button>
          {viewWorker && !loadingViewWorker && !viewWorkerError && (
            <Button variant="contained" onClick={() => nav('/workers/edit/' + viewWorker.id, { state: { worker: viewWorker } })}>Edit</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
