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
import { Add, DeleteOutline, Download, Edit, FileUpload, Search, Visibility } from '@mui/icons-material';
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

const workerImportSampleCsv = `first_name,last_name,phone,email,gender,joining_date,salary_type,salary_amount,payment_mode,bank_name,account_number,ifsc_code,upi_id
Ravi,Kumar,9876543210,ravi@gmail.com,Male,01/08/2026,DAILY,800,CASH,,,,
Suresh,,9876543211,suresh@gmail.com,Male,01/08/2026,MONTHLY,25000,BANK,HDFC,1234567890,HDFC0001234,
Priya,,9876543212,priya@gmail.com,Female,01/08/2026,WEEKLY,5000,UPI,,,,priya@upi
`;

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

function getImportSummary(data) {
  return data?.data || {};
}

function getImportWarningMessage(summary) {
  const errors = Array.isArray(summary?.errors) ? summary.errors : [];
  const failedCount = Number(summary?.failed_count || errors.length || 0);

  if (errors.length > 0) {
    return [
      `${failedCount} record${failedCount === 1 ? '' : 's'} failed.`,
      ...errors.map((error) => `Row ${error.row || '-'} - ${error.message || 'Unable to import this row.'}`),
    ].join('\n');
  }

  return failedCount > 0 ? `${failedCount} records could not be imported.` : 'Import completed. Some records could not be imported.';
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
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importError, setImportError] = useState('');
  const [importingWorkers, setImportingWorkers] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');
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

  useEffect(() => {
    if (!importError) return undefined;

    const timer = window.setTimeout(() => setImportError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [importError]);

  useEffect(() => {
    if (!deleteError) return undefined;

    const timer = window.setTimeout(() => setDeleteError(''), 5000);
    return () => window.clearTimeout(timer);
  }, [deleteError]);

  useEffect(() => {
    if (!importResult) return undefined;

    const timer = window.setTimeout(() => setImportResult(null), 5000);
    return () => window.clearTimeout(timer);
  }, [importResult]);

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

  const handleDownloadSampleCsv = () => {
    const blob = new Blob([workerImportSampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'worker-import-sample.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenImportDialog = () => {
    setImportFile(null);
    setImportError('');
    setImportDialogOpen(true);
  };

  const handleCloseImportDialog = () => {
    if (importingWorkers) return;

    setImportDialogOpen(false);
    setImportFile(null);
    setImportError('');
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setImportFile(null);
      setImportError('Only .csv files can be uploaded.');
      return;
    }

    setImportFile(file);
    setImportError('');
  };

  const handleUploadWorkers = async () => {
    if (!importFile) {
      setImportError('Select a CSV file before uploading.');
      return;
    }

    setImportingWorkers(true);
    setImportError('');

    try {
      const response = await workerApi.importWorkers(importFile);
      const summary = getImportSummary(response.data);
      const failedCount = Number(summary.failed_count || 0);

      setImportResult(summary);
      setImportDialogOpen(false);
      setImportFile(null);
      await loadWorkers();

      if (failedCount > 0) {
        setWarningMessage(getImportWarningMessage(summary));
      } else {
        setSuccessMessage(response.data?.message || 'Worker import successfully');
      }
    } catch (apiError) {
      setImportError(apiError.response?.data?.message || 'Unable to import workers. Please try again.');
    } finally {
      setImportingWorkers(false);
    }
  };

  const hasImportFailures = Number(importResult?.failed_count || 0) > 0;
  const importErrors = Array.isArray(importResult?.errors) ? importResult.errors : [];

  return (
    <Box className="page">
      <Snackbar
        open={!!successMessage}
        autoHideDuration={5000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!warningMessage}
        autoHideDuration={5000}
        onClose={() => setWarningMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="warning" onClose={() => setWarningMessage('')} sx={{ whiteSpace: 'pre-line' }}>
          {warningMessage}
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
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} className="workerImportActions">
            <Button onClick={handleDownloadSampleCsv} variant="outlined" startIcon={<Download />}>Download Sample CSV</Button>
            <Button onClick={handleOpenImportDialog} variant="outlined" startIcon={<FileUpload />}>Import Workers</Button>
            <Button onClick={() => nav('/workers/add')} variant="contained" startIcon={<Add />}>Add Worker</Button>
          </Stack>
        </Box>

        {importResult && (
          <Box className="workerImportSummary">
            <Alert severity={hasImportFailures ? 'warning' : 'success'} onClose={() => setImportResult(null)}>
              <Typography fontWeight={800} mb={1}>Import Completed</Typography>
              <Box className="workerImportSummaryGrid">
                <span>Total Records: <b>{importResult.total_records ?? 0}</b></span>
                <span>Imported Successfully: <b>{importResult.success_count ?? 0}</b></span>
                <span>Failed Records: <b>{importResult.failed_count ?? 0}</b></span>
              </Box>
            </Alert>
            {importErrors.length > 0 && (
              <Box className="adminUsersTableWrap workerImportErrorsWrap">
                <table className="adminUsersTable workerImportErrorsTable">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Error Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importErrors.map((error, index) => (
                      <tr key={`${error.row || 'row'}-${index}`}>
                        <td><span className="adminUsersCode">Row {error.row || '-'}</span></td>
                        <td>{error.message || 'Unable to import this row.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            )}
          </Box>
        )}

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
      <Dialog open={importDialogOpen} onClose={handleCloseImportDialog} fullWidth maxWidth="sm">
        <DialogTitle>Import Workers</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ pt: 1 }}>
            <Alert severity="info">Upload a CSV file using the sample format.</Alert>
            <Button component="label" variant="outlined" startIcon={<FileUpload />} disabled={importingWorkers}>
              Select CSV File
              <input type="file" accept=".csv,text/csv" hidden onChange={handleImportFileChange} />
            </Button>
            <Box className="workerImportFileName">
              <span>Selected file</span>
              <b>{importFile?.name || 'No file selected'}</b>
            </Box>
            {importError && <Alert severity="error">{importError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImportDialog} disabled={importingWorkers}>Cancel</Button>
          <Button variant="contained" onClick={handleUploadWorkers} disabled={importingWorkers || !importFile}>
            {importingWorkers ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
