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
import {
  AccountBalanceWallet,
  CalendarToday,
  CheckCircleOutline,
  InfoOutlined,
  PendingActions,
} from '@mui/icons-material';
import { paymentApi } from '../../api/paymentApi.js';
import StatusChip from '../../components/common/StatusChip.jsx';
import { money, shortDate } from '../../components/common/formatters.js';
import '../../styles/adminUsers.css';
import '../../styles/paymentDetails.css';

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

function isPaidStatus(value) {
  return String(value || '').toLowerCase().includes('paid');
}

function isPendingStatus(value) {
  return String(value || '').toLowerCase().includes('pending');
}

function getPaymentModeGuideClass(value) {
  return String(value || '').trim().toLowerCase() === 'cash'
    ? 'paymentModeBadgeManual'
    : 'paymentModeBadgeAuto';
}

function SummaryCard({ icon, title, value, count, tone }) {
  return (
    <Box className={`paymentSummaryCard paymentSummaryCard-${tone}`}>
      <Box className="paymentSummaryIcon">{icon}</Box>
      <Box className="paymentSummaryContent">
        <Box className="paymentSummaryTitle">
          {title}
          <InfoOutlined fontSize="inherit" />
        </Box>
        <strong>{value}</strong>
        <span>{count} {count === 1 ? 'Worker' : 'Workers'}</span>
      </Box>
    </Box>
  );
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
  const pendingWorkersCount = workers.filter((worker) => isPendingStatus(worker.payment_status)).length;
  const completedWorkersCount = workers.filter((worker) => isPaidStatus(worker.payment_status)).length;
  const paymentTypeLabel = getStatusLabel(paymentData.payment_type || paymentType);

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
    <Box className="page paymentDetailsPage">
      <Stack spacing={3}>
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

        <Box className="paymentPeriodBar">
          <CalendarToday fontSize="small" />
          <Typography>
            <span>Payment Period:</span> {hasPeriod ? `${shortDate(paymentData.start_date)} - ${shortDate(paymentData.end_date)}` : '-'}
          </Typography>
        </Box>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard
              icon={<AccountBalanceWallet />}
              title="Total Payable"
              value={money(summary.total_payable)}
              count={workers.length}
              tone="total"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard
              icon={<PendingActions />}
              title="Pending Payment"
              value={money(summary.pending_payment_today)}
              count={pendingWorkersCount}
              tone="pending"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SummaryCard
              icon={<CheckCircleOutline />}
              title="Completed Payment"
              value={money(summary.completed_payment_today)}
              count={completedWorkersCount}
              tone="completed"
            />
          </Grid>
        </Grid>

        <section className="adminUsersSection workerListSection paymentWorkersSection">
          <Box className="adminUsersSectionHead">
            <Box>
              <h2>Workers ({paymentTypeLabel})</h2>
              <div>Track {paymentTypeLabel.toLowerCase()} salary payments to your workers</div>
            </Box>
            <Box className="paymentModeGuide">
              <b>Payment Mode Guide:</b>
              <span><i className="paymentGuideDot paymentGuideManual" />Manual Payment</span>
              <span><i className="paymentGuideDot paymentGuideAuto" />Auto Payment</span>
            </Box>
          </Box>

          <Box className="adminUsersTableWrap">
            <table className="adminUsersTable paymentDetailsTable">
              <thead>
                <tr>
                  <th>Worker</th>
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
                    <td colSpan={7}>
                      <Box className="adminUsersState">Loading payment details...</Box>
                    </td>
                  </tr>
                )}
                {!loadingPayment && !paymentError && workers.map((worker) => (
                  <tr key={worker.id}>
                    <td>
                      <Box className="paymentWorkerName">
                        <b>{getDisplayValue(worker.name)}</b>
                      </Box>
                    </td>
                    <td><b>{money(worker.salary_amount)}</b></td>
                    <td>
                      <span className={`workerAdminBadge ${getPaymentModeGuideClass(worker.payment_mode)}`}>
                        {getDisplayValue(worker.payment_mode)}
                      </span>
                    </td>
                    <td>{getDisplayValue(worker.present_days)}</td>
                    <td>{getDisplayValue(worker.total_days)}</td>
                    <td><b>{money(worker.payment_amount)}</b></td>
                    <td><StatusChip value={getStatusLabel(worker.payment_status)} /></td>
                  </tr>
                ))}
                {!loadingPayment && !paymentError && workers.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <Box className="adminUsersState">No workers found for this payment type.</Box>
                    </td>
                  </tr>
                )}
                {!loadingPayment && paymentError && (
                  <tr>
                    <td colSpan={7}>
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
