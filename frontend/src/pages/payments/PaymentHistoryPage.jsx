import { Box, Button, Card, CardContent, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { FileDownload, Search } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import StatusChip from '../../components/common/StatusChip.jsx';
import { money } from '../../components/common/formatters.js';
import paymentsData from '../../data/payments.json';

export default function PaymentHistoryPage() {
  const columns = [
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'worker', headerName: 'Worker', flex: 1.2 },
    { field: 'amount', headerName: 'Amount', flex: 1, valueFormatter: (value) => money(value) },
    { field: 'mode', headerName: 'Payment mode', flex: 1 },
    { field: 'salaryType', headerName: 'Salary type', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1, renderCell: (params) => <StatusChip value={params.value} /> },
    { field: 'transaction', headerName: 'Transaction ID', flex: 1.3 },
  ];

  return (
    <Box className="page">
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5">Payment history</Typography>
          <Typography className="muted">Track every salary payment in one place.</Typography>
        </Box>
        <Button variant="outlined" startIcon={<FileDownload />}>Export</Button>
      </Stack>
      <Card>
        <CardContent>
          <TextField size="small" placeholder="Search payments..." sx={{ mb: 2, width: { xs: '100%', sm: 320 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
          <DataGrid rows={paymentsData} columns={columns} autoHeight disableRowSelectionOnClick pageSizeOptions={[5, 10]} initialState={{ pagination: { paginationModel: { pageSize: 8 } } }} />
        </CardContent>
      </Card>
    </Box>
  );
}
