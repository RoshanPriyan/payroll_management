import { Chip } from '@mui/material';

export default function StatusChip({ value }) {
  return (
    <Chip
      size="small"
      label={value}
      sx={{
        fontWeight: 700,
        bgcolor: value === 'Active' || value === 'Paid' || value === 'Present' ? '#e9f8ef' : value === 'Pending' ? '#fff5dc' : '#fff0f0',
        color: value === 'Active' || value === 'Paid' || value === 'Present' ? '#198754' : value === 'Pending' ? '#9a6500' : '#d34a4a',
      }}
    />
  );
}
