import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, CircularProgress, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { workerApi } from '../../api/workerApi.js';
import FormField from '../../components/common/FormField.jsx';

const initialWorkerForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  gender: '',
  address: '',
  salary_amount: '',
  salary_type: 'DAILY',
  payment_mode: 'BANK',
  bank_name: '',
  account_number: '',
  ifsc_code: '',
  upi_id: '',
  joining_date: '',
  status: 'Active',
};

const editWorkerForm = {
  ...initialWorkerForm,
  salary_type: '',
  payment_mode: '',
  status: '',
};

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

const salaryTypeValues = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
};

const paymentModeValues = {
  cash: 'CASH',
  bank: 'BANK',
  'bank transfer': 'BANK',
  upi: 'UPI',
};

const statusValues = {
  active: 'Active',
  inactive: 'Inactive',
};

const genderLabels = {
  MALE: 'Male',
  FEMALE: 'Female',
};

const genderValues = {
  male: 'MALE',
  female: 'FEMALE',
};

const workerUpdateFields = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'gender',
  'joining_date',
  'salary_type',
  'salary_amount',
  'payment_mode',
  'bank_name',
  'account_number',
  'ifsc_code',
  'upi_id',
];

function getApiErrorMessage(apiError, fallback = 'Unable to save worker. Please try again.') {
  if (apiError?.message) return apiError.message;
  if (!apiError?.response) return 'Unable to connect to server.';
  return apiError.response.data?.message || fallback;
}

function normalizeOption(value, options) {
  if (!value) return '';
  const normalizedValue = String(value).trim();
  return options[normalizedValue.toLowerCase()] || normalizedValue.toUpperCase();
}

function normalizeStatus(value) {
  if (!value) return '';
  const normalizedValue = String(value).trim();
  return statusValues[normalizedValue.toLowerCase()] || normalizedValue;
}

function normalizeGender(value) {
  if (!value) return '';
  const normalizedValue = String(value).trim();
  return genderValues[normalizedValue.toLowerCase()] || normalizedValue.toUpperCase();
}

function getWorkerItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.workers)) return data.data.workers;
  if (Array.isArray(data?.workers)) return data.workers;
  return [];
}

function getWorkerFromResponse(data, workerId) {
  const items = getWorkerItems(data);
  return items.find((worker) => String(worker.id || worker.worker_id || worker.workerId) === String(workerId)) || items[0] || data?.data || data?.worker || data;
}

function toDateInputValue(value) {
  if (!value) return '';
  return String(value).slice(0, 10);
}

function buildFormFromWorker(worker = {}) {
  const source = worker.raw || worker;
  const firstName = source.first_name || source.firstName || worker.first_name || '';
  const lastName = source.last_name || source.lastName || worker.last_name || '';

  return {
    ...editWorkerForm,
    first_name: firstName,
    last_name: lastName,
    email: source.email || worker.email || '',
    phone: source.phone || source.phone_number || worker.phone || '',
    gender: normalizeGender(source.gender || worker.gender),
    address: source.address || worker.address || '',
    salary_amount: String(source.salary_amount || source.salary || worker.salary_amount || worker.salary || ''),
    salary_type: normalizeOption(source.salary_type || source.salaryType || worker.salary_type || worker.salaryType, salaryTypeValues),
    payment_mode: normalizeOption(source.payment_mode || source.paymentMode || worker.payment_mode || worker.paymentMode, paymentModeValues),
    bank_name: source.bank_name || worker.bank_name || '',
    account_number: source.account_number || worker.account_number || '',
    ifsc_code: source.ifsc_code || worker.ifsc_code || '',
    upi_id: source.upi_id || worker.upi_id || '',
    joining_date: toDateInputValue(source.joining_date || worker.joining_date),
    status: normalizeStatus(source.status || worker.status),
  };
}

function buildWorkerUpdatePayload(workerId, form, initialForm) {
  const currentValues = {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    gender: form.gender,
    joining_date: form.joining_date,
    salary_type: form.salary_type,
    salary_amount: form.salary_amount ? Number(form.salary_amount) : '',
    payment_mode: form.payment_mode,
    bank_name: form.bank_name.trim(),
    account_number: form.account_number.trim(),
    ifsc_code: form.ifsc_code.trim(),
    upi_id: form.upi_id.trim(),
  };
  const initialValues = {
    first_name: initialForm.first_name.trim(),
    last_name: initialForm.last_name.trim(),
    email: initialForm.email.trim(),
    phone: initialForm.phone.trim(),
    gender: initialForm.gender,
    joining_date: initialForm.joining_date,
    salary_type: initialForm.salary_type,
    salary_amount: initialForm.salary_amount ? Number(initialForm.salary_amount) : '',
    payment_mode: initialForm.payment_mode,
    bank_name: initialForm.bank_name.trim(),
    account_number: initialForm.account_number.trim(),
    ifsc_code: initialForm.ifsc_code.trim(),
    upi_id: initialForm.upi_id.trim(),
  };

  return workerUpdateFields.reduce((payload, field) => {
    if (currentValues[field] === initialValues[field]) return payload;
    return {
      ...payload,
      [field]: currentValues[field],
    };
  }, { worker_id: Number(workerId) });
}

export default function WorkerFormPage({ editing = false }) {
  const nav = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const selectedWorker = location.state?.worker;
  const selectedWorkerForm = editing && selectedWorker ? buildFormFromWorker(selectedWorker) : null;
  const [form, setForm] = useState(() => (editing ? selectedWorkerForm || editWorkerForm : initialWorkerForm));
  const [initialEditForm, setInitialEditForm] = useState(() => selectedWorkerForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingWorker, setLoadingWorker] = useState(() => editing);
  const mode = form.payment_mode;
  const isBusy = saving || loadingWorker;

  useEffect(() => {
    if (!editing) return undefined;

    let ignore = false;

    workerApi.getWorkerById(id)
      .then((response) => {
        if (ignore) return;
        const nextForm = buildFormFromWorker(getWorkerFromResponse(response.data, id));
        setForm(nextForm);
        setInitialEditForm(nextForm);
      })
      .catch((apiError) => {
        if (ignore) return;
        setSubmitError(getApiErrorMessage(apiError, 'Unable to load worker details.'));
      })
      .finally(() => {
        if (!ignore) setLoadingWorker(false);
      });

    return () => {
      ignore = true;
    };
  }, [editing, id, selectedWorker]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;

    setSubmitError('');
    setErrors((current) => ({
      ...current,
      [name]: '',
      ...(name === 'payment_mode'
        ? {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          upi_id: '',
        }
        : {}),
    }));
    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(!editing && name === 'payment_mode' && nextValue === 'CASH'
        ? {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
          upi_id: '',
        }
        : {}),
      ...(!editing && name === 'payment_mode' && nextValue === 'BANK'
        ? {
          upi_id: '',
        }
        : {}),
      ...(!editing && name === 'payment_mode' && nextValue === 'UPI'
        ? {
          bank_name: '',
          account_number: '',
          ifsc_code: '',
        }
        : {}),
    }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const salaryAmount = Number(form.salary_amount);
    const email = form.email.trim();

    if (!editing && !form.first_name.trim()) nextErrors.first_name = 'First name is required.';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.';
    if (!editing && !form.phone.trim()) nextErrors.phone = 'Phone is required.';
    if (form.phone.trim() && form.phone.trim().length !== 10) nextErrors.phone = 'Phone must be 10 digits.';
    if (!editing && !form.joining_date) nextErrors.joining_date = 'Joining date is required.';
    if (!editing && !form.salary_type) nextErrors.salary_type = 'Salary type is required.';
    if (!editing && !form.salary_amount) {
      nextErrors.salary_amount = 'Salary amount is required.';
    } else if (form.salary_amount && (!Number.isFinite(salaryAmount) || salaryAmount <= 0)) {
      nextErrors.salary_amount = 'Salary amount must be greater than 0.';
    }
    if (!editing && !form.payment_mode) nextErrors.payment_mode = 'Payment mode is required.';

    if (!editing && form.payment_mode === 'BANK') {
      if (!form.bank_name.trim()) nextErrors.bank_name = 'Bank name is required.';
      if (!form.account_number.trim()) nextErrors.account_number = 'Account number is required.';
      if (!form.ifsc_code.trim()) nextErrors.ifsc_code = 'IFSC code is required.';
    }

    if (!editing && form.payment_mode === 'UPI' && !form.upi_id.trim()) {
      nextErrors.upi_id = 'UPI ID is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isBusy || !validateForm()) {
      return;
    }

    if (editing) {
      const payload = buildWorkerUpdatePayload(id, form, initialEditForm || editWorkerForm);
      const hasChanges = Object.keys(payload).some((field) => field !== 'worker_id');

      if (!hasChanges) {
        setSubmitError('Change at least one field before saving.');
        return;
      }

      setSaving(true);
      setSubmitError('');

      try {
        const response = await workerApi.updateWorker(payload);
        const message = response.data?.message || 'Worker updated successfully';

        if (response.data?.success === false) {
          throw new Error(message);
        }

        nav('/workers', { state: { workerCreatedMessage: message, refreshWorkers: true } });
      } catch (apiError) {
        setSubmitError(getApiErrorMessage(apiError));
      } finally {
        setSaving(false);
      }

      return;
    }

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      joining_date: form.joining_date,
      salary_type: form.salary_type,
      salary_amount: Number(form.salary_amount),
      payment_mode: form.payment_mode,
    };

    if (!payload.email) delete payload.email;
    if (!payload.gender) delete payload.gender;

    if (form.payment_mode === 'BANK') {
      payload.bank_name = form.bank_name.trim();
      payload.account_number = form.account_number.trim();
      payload.ifsc_code = form.ifsc_code.trim();
    }

    if (form.payment_mode === 'UPI') {
      payload.upi_id = form.upi_id.trim();
    }

    setSaving(true);
    setSubmitError('');

    try {
      const response = await workerApi.createWorker(payload);
      const message = response.data?.message || 'Worker created successfully';

      if (response.data?.success === false) {
        throw new Error(message);
      }

      setForm(initialWorkerForm);
      nav('/workers', { state: { workerCreatedMessage: message, refreshWorkers: true } });
    } catch (apiError) {
      setSubmitError(getApiErrorMessage(apiError, 'Unable to create worker. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box className="page formPage">
      <Typography variant="h5">{editing ? 'Edit worker' : 'Add a new worker'}</Typography>
      <Typography className="muted" mb={3}>{editing ? 'Update only the details that need to change.' : 'Enter worker details to keep payroll organized.'}</Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
            {loadingWorker && <Alert severity="info" sx={{ mb: 2 }}>Loading worker details...</Alert>}
            <Grid container spacing={2.5}>
              <FormField
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                error={!!errors.first_name}
                helperText={errors.first_name}
                disabled={isBusy}
                required={!editing}
              />
              <FormField
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                disabled={isBusy}
              />
              <FormField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                type="email"
                disabled={isBusy}
              />
              <FormField
                label="Phone number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                disabled={isBusy}
                required={!editing}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10, pattern: '[0-9]*' } }}
              />
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  disabled={isBusy}
                >
                  <MenuItem value="" disabled>Select gender</MenuItem>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  disabled={isBusy}
                />
              </Grid>
              <FormField
                label="Salary amount"
                name="salary_amount"
                value={form.salary_amount}
                onChange={handleChange}
                error={!!errors.salary_amount}
                helperText={errors.salary_amount}
                type="number"
                disabled={isBusy}
                required={!editing}
                slotProps={{ htmlInput: { min: 1, step: 'any' } }}
              />
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Salary type"
                  name="salary_type"
                  value={form.salary_type}
                  onChange={handleChange}
                  error={!!errors.salary_type}
                  helperText={errors.salary_type}
                  disabled={isBusy}
                  required={!editing}
                >
                  {editing && <MenuItem value="" disabled>Select salary type</MenuItem>}
                  {Object.entries(salaryTypeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Payment mode"
                  name="payment_mode"
                  value={mode}
                  onChange={handleChange}
                  error={!!errors.payment_mode}
                  helperText={errors.payment_mode}
                  disabled={isBusy}
                  required={!editing}
                >
                  {editing && <MenuItem value="" disabled>Select payment mode</MenuItem>}
                  {Object.entries(paymentModeLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>{label}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {mode === 'BANK' && (
                <>
                  <FormField
                    label="Bank name"
                    name="bank_name"
                    value={form.bank_name}
                    onChange={handleChange}
                    error={!!errors.bank_name}
                    helperText={errors.bank_name}
                    disabled={isBusy}
                    required={!editing}
                  />
                  <FormField
                    label="Account number"
                    name="account_number"
                    value={form.account_number}
                    onChange={handleChange}
                    error={!!errors.account_number}
                    helperText={errors.account_number}
                    disabled={isBusy}
                    required={!editing}
                  />
                  <FormField
                    label="IFSC code"
                    name="ifsc_code"
                    value={form.ifsc_code}
                    onChange={handleChange}
                    error={!!errors.ifsc_code}
                    helperText={errors.ifsc_code}
                    disabled={isBusy}
                    required={!editing}
                  />
                </>
              )}
              {mode === 'UPI' && (
                <FormField
                  label="UPI ID"
                  name="upi_id"
                  value={form.upi_id}
                  onChange={handleChange}
                  error={!!errors.upi_id}
                  helperText={errors.upi_id}
                  disabled={isBusy}
                  required={!editing}
                />
              )}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Joining date"
                  name="joining_date"
                  value={form.joining_date}
                  onChange={handleChange}
                  error={!!errors.joining_date}
                  helperText={errors.joining_date}
                  type="date"
                  disabled={isBusy}
                  required={!editing}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isBusy}
                >
                  {editing && <MenuItem value="" disabled>Select status</MenuItem>}
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Stack direction="row" gap={1.5} mt={4}>
              <Button
                variant="contained"
                type="submit"
                disabled={isBusy}
                startIcon={saving ? <CircularProgress color="inherit" size={16} /> : null}
              >
                {saving ? 'Saving...' : 'Save worker'}
              </Button>
              <Button onClick={() => nav('/workers')} disabled={isBusy}>Cancel</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
