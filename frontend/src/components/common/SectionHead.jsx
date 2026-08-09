import { Box, Stack, Typography } from '@mui/material';

export default function SectionHead({ title, sub, action }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" className="dashSectionHead">
      <Box>
        <Typography variant="h6">{title}</Typography>
        {sub && <Typography className="muted">{sub}</Typography>}
      </Box>
      {action}
    </Stack>
  );
}
