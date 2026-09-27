import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { paymentApi } from '../../api/paymentApi.js';
import StatusChip from '../../components/common/StatusChip.jsx';
import { money } from '../../components/common/formatters.js';
import '../../styles/paymentHistory.css';

const PAYMENT_TYPE_OPTIONS = [
  { label: 'All Payment Types', value: '' },
  { label: 'Daily', value: 'DAILY' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
];

const PAYMENT_MODE_OPTIONS = [
  { label: 'All Payment Modes', value: '' },
  { label: 'Cash', value: 'CASH' },
  { label: 'Bank', value: 'BANK' },
  { label: 'UPI', value: 'UPI' },
];

export default function PaymentHistoryPage() {
  const [rows, setRows] = useState([]);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    paymentType: '',
    paymentMode: '',
    startDate: '',
    endDate: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const loadPaymentHistory = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await paymentApi.getPaymentHistory({
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        payment_type: appliedFilters.paymentType || null,
        payment_mode: appliedFilters.paymentMode || null,
        start_date: appliedFilters.startDate || null,
        end_date: appliedFilters.endDate || null,
      });
      const history = response.data;

      setRows((history.data || []).map((payment) => ({
        id: payment.id,
        date: payment.payment_date ?? '-',
        worker: payment.user_name,
        amount: payment.amount_paid,
        mode: payment.payment_mode,
        salaryType: payment.salary_type,
        status: payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1).toLowerCase(),
      })));
      setRowCount(history.pagination?.total || (history.pagination?.total_pages || 0) * paginationModel.pageSize);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load payment history.');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, paginationModel]);

  useEffect(() => {
    const timer = window.setTimeout(loadPaymentHistory, 0);
    return () => window.clearTimeout(timer);
  }, [loadPaymentHistory]);

  const handleFilterChange = (key, value) => {
    setFilters((currentFilters) => ({ ...currentFilters, [key]: value }));
  };

  const handleSearch = () => {
    setPaginationModel((currentModel) => ({ ...currentModel, page: 0 }));
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      paymentType: '',
      paymentMode: '',
      startDate: '',
      endDate: '',
    };

    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPaginationModel((currentModel) => ({ ...currentModel, page: 0 }));
  };

  const columns = [
    { field: 'worker', headerName: 'Worker', flex: 1.2 },
    { field: 'amount', headerName: 'Amount', flex: 1, valueFormatter: (value) => money(value) },
    { field: 'mode', headerName: 'Payment mode', flex: 1 },
    { field: 'salaryType', headerName: 'Salary type', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1, renderCell: (params) => <StatusChip value={params.value} /> },
    { field: 'date', headerName: 'Payment Date', flex: 1 },
  ];

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
              <Typography className="muted" mb={0.75}>Payment Type</Typography>
              <Select fullWidth size="small" value={filters.paymentType} onChange={(event) => handleFilterChange('paymentType', event.target.value)}>
                {PAYMENT_TYPE_OPTIONS.map((option) => <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Typography className="muted" mb={0.75}>Payment Mode</Typography>
              <Select fullWidth size="small" value={filters.paymentMode} onChange={(event) => handleFilterChange('paymentMode', event.target.value)}>
                {PAYMENT_MODE_OPTIONS.map((option) => <MenuItem key={option.value || 'all'} value={option.value}>{option.label}</MenuItem>)}
              </Select>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <Stack width="100%" direction="row" justifyContent={{ xs: 'stretch', md: 'flex-end' }} gap={1}>
                <Button sx={{ minWidth: 96, flex: { xs: 1, md: 'initial' } }} variant="contained" startIcon={<Search />} onClick={handleSearch} disabled={loading}>Search</Button>
                <Button sx={{ minWidth: 80, flex: { xs: 1, md: 'initial' } }} variant="outlined" color="inherit" onClick={handleReset} disabled={loading}>Reset</Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box className="paymentHistoryGridWrap">
            <DataGrid
              className="paymentHistoryGrid"
              rows={rows}
              columns={columns}
              autoHeight
              disableColumnSorting
              disableColumnMenu
              disableRowSelectionOnClick
              loading={loading}
              paginationMode="server"
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              rowCount={rowCount}
              pageSizeOptions={[10]}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
