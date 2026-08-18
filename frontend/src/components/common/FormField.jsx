import { Grid, TextField } from '@mui/material';

export default function FormField({ label, type = 'text', ...props }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <TextField fullWidth label={label} type={type} {...props} />
    </Grid>
  );
}
