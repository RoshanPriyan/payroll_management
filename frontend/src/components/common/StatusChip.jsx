import { Chip } from '@mui/material';

export default function StatusChip({ value }) {
  const isPositive = ['Active', 'Paid', 'Present', 'Auto Paid'].includes(value);
  const isHalfDay = value === 'Half Day';

  return (
    <Chip
      size="small"
      label={value}
      sx={{
        fontWeight: 700,
        bgcolor: isPositive ? '#e9f8ef' : isHalfDay || value === 'Pending' ? '#fff5dc' : '#fff0f0',
        color: isPositive ? '#198754' : isHalfDay || value === 'Pending' ? '#9a6500' : '#d34a4a',
      }}
    />
  );
}
