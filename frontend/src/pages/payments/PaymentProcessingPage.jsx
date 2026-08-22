import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { AccountBalanceWallet, CheckCircleOutline, PendingActions } from '@mui/icons-material';
import { paymentApi } from '../../api/paymentApi.js';
import StatusChip from '../../components/common/StatusChip.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { money, shortDate } from '../../components/common/formatters.js';
import '../../styles/adminUsers.css';

const paymentTypes = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

const paymentTabs = [
  { label: 'Daily', value: paymentTypes.daily },
  { label: 'Weekly', value: paymentTypes.weekly },
  { label: 'Monthly', value: paymentTypes.monthly },
];

const emptyPaymentData = {
  payment_type: '',
  start_date: '',
  end_date: '',
  summary: {
    total_payable: 0,
    pending_payment_today: 0,
    completed_payment_today: 0,
  },
  workers: [],
};

function getApiMessage(apiError, fallback) {
  return (
    apiError.response?.data?.detail
    || apiError.response?.data?.details
    || apiError.response?.data?.message
    || fallback
  );
}

function getPaymentData(responseData) {
  return responseData?.data || responseData || emptyPaymentData;
}

function getStatusLabel(value) {
  if (!value) return '-';

  return String(value)
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getDisplayValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  return value;
}

export default function PaymentProcessingPage() {
  const [paymentType, setPaymentType] = useState(paymentTypes.daily);
  const [paymentDataByType, setPaymentDataByType] = useState({});
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [paymentError, setPaymentError] = useState('');
  const paymentData = paymentDataByType[paymentType] || emptyPaymentData;
  const summary = paymentData.summary || emptyPaymentData.summary;
  const workers = Array.isArray(paymentData.workers) ? paymentData.workers : [];
  const hasPeriod = paymentData.start_date || paymentData.end_date;

  useEffect(() => {
    let ignore = false;

    if (paymentDataByType[paymentType]) return undefined;

    async function loadPaymentDetails() {
      setLoadingPayment(true);
      setPaymentError('');

      try {
        const response = await paymentApi.getPaymentDetails(paymentType);
        const nextPaymentData = getPaymentData(response.data);

        if (ignore) return;

        setPaymentDataByType((currentData) => ({
          ...currentData,
          [paymentType]: {
            ...emptyPaymentData,
            ...nextPaymentData,
            summary: {
              ...emptyPaymentData.summary,
              ...(nextPaymentData.summary || {}),
            },
            workers: Array.isArray(nextPaymentData.workers) ? nextPaymentData.workers : [],
          },
        }));
      } catch (apiError) {
        if (ignore) return;

        setPaymentError(getApiMessage(apiError, 'Unable to load payment details. Please try again.'));
      } finally {
        if (!ignore) setLoadingPayment(false);
      }
    }

    loadPaymentDetails();

    return () => {
      ignore = true;
    };
  }, [paymentDataByType, paymentType]);

  const handlePaymentTypeChange = (_event, nextPaymentType) => {
    setLoadingPayment(!paymentDataByType[nextPaymentType]);
    setPaymentError('');
    setPaymentType(nextPaymentType);
  };

  return (
    <Box className="page">
      <Stack spacing={3}>
        <Typography className="muted">View and manage worker payments.</Typography>

        <Box className="paymentDetailsTabsWrap">
          <Tabs
            value={paymentType}
            onChange={handlePaymentTypeChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Payment type"
          >
            {paymentTabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} disabled={loadingPayment && tab.value !== paymentType} />
            ))}
          </Tabs>
        </Box>

        {paymentError && <Alert severity="error">{paymentError}</Alert>}

        <Box>
          <Typography className="muted" fontWeight={700}>
            Payment Period: {hasPeriod ? `${shortDate(paymentData.start_date)} - ${shortDate(paymentData.end_date)}` : '-'}
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard icon={<AccountBalanceWallet />} title="Total Payable" value={money(summary.total_payable)} trend="" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard icon={<PendingActions />} title="Pending Payment" value={money(summary.pending_payment_today)} trend="" color="#f59e0b" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <StatCard icon={<CheckCircleOutline />} title="Completed Payment" value={money(summary.completed_payment_today)} trend="" color="#16a34a" />
          </Grid>
        </Grid>

        <section className="adminUsersSection workerListSection">
          <Box className="adminUsersSectionHead">
            <Box>
              <h2>Workers</h2>
              <div>{getStatusLabel(paymentData.payment_type || paymentType)} payments</div>
            </Box>
          </Box>

          <Box className="adminUsersTableWrap">
            <table className="adminUsersTable paymentDetailsTable">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Salary Type</th>
                  <th>Salary</th>
                  <th>Payment Mode</th>
                  <th>Present Days</th>
                  <th>Total Days</th>
                  <th>Payable Amount</th>
                  <th>Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingPayment && (
                  <tr>
                    <td colSpan={8}>
                      <Box className="adminUsersState">Loading payment details...</Box>
                    </td>
                  </tr>
                )}
                {!loadingPayment && !paymentError && workers.map((worker) => (
                  <tr key={worker.id}>
                    <td><b>{getDisplayValue(worker.name)}</b></td>
                    <td>{getDisplayValue(worker.salary_type)}</td>
                    <td><b>{money(worker.salary_amount)}</b></td>
                    <td><span className="workerAdminBadge">{getDisplayValue(worker.payment_mode)}</span></td>
                    <td>{getDisplayValue(worker.present_days)}</td>
                    <td>{getDisplayValue(worker.total_days)}</td>
                    <td><b>{money(worker.payment_amount)}</b></td>
                    <td><StatusChip value={getStatusLabel(worker.payment_status)} /></td>
                  </tr>
                ))}
                {!loadingPayment && !paymentError && workers.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <Box className="adminUsersState">No workers found for this payment type.</Box>
                    </td>
                  </tr>
                )}
                {!loadingPayment && paymentError && (
                  <tr>
                    <td colSpan={8}>
                      <Box className="adminUsersState">Payment details are unavailable.</Box>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </section>

      </Stack>
    </Box>
  );
}
