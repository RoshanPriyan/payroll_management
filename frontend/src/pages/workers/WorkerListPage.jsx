import { useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, InputAdornment, Select, Stack, TextField, Typography, MenuItem } from '@mui/material';
import { Add, DeleteOutline, Edit, MoreHoriz, Search, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import StatusChip from '../../components/common/StatusChip.jsx';
import { money } from '../../components/common/formatters.js';
import workersData from '../../data/workers.json';

export default function WorkerListPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [confirm, setConfirm] = useState(null);
  const nav = useNavigate();
  const workers = workersData.filter((worker) => (type === 'All' || worker.salaryType === type) && worker.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Box className="page">
      <Stack className="toolrow" direction={{ xs: 'column', sm: 'row' }} gap={2}>
        <TextField fullWidth placeholder="Search workers by name or phone..." value={query} onChange={(event) => setQuery(event.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
        <Select value={type} onChange={(event) => setType(event.target.value)} sx={{ minWidth: 150 }}>
          {['All', 'Daily', 'Weekly', 'Monthly'].map((item) => <MenuItem key={item} value={item}>{item} salary</MenuItem>)}
        </Select>
      </Stack>
      <Grid container spacing={2.5} mt={1}>
        {workers.map((worker) => (
          <Grid key={worker.id} size={{ xs: 12, sm: 6, xl: 4 }}>
            <Card className="workerCard">
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Avatar className="workerAvatar">{worker.name.split(' ').map((name) => name[0]).join('')}</Avatar>
                  <IconButton><MoreHoriz /></IconButton>
                </Stack>
                <Typography variant="h6" mt={2}>{worker.name}</Typography>
                <Typography className="muted">{worker.role} · {worker.phone}</Typography>
                <Stack direction="row" gap={1} mt={1.5}>
                  <StatusChip value={worker.status} />
                  <Chip size="small" label={worker.salaryType} />
                </Stack>
                <Box className="salary">
                  <Typography className="muted">{worker.salaryType} salary</Typography>
                  <b>{money(worker.salary)}</b>
                </Box>
                <Stack direction="row" gap={1}>
                  <Button size="small" startIcon={<Visibility />}>View</Button>
                  <Button size="small" startIcon={<Edit />} onClick={() => nav('/workers/edit/' + worker.id)}>Edit</Button>
                  <IconButton color="error" onClick={() => setConfirm(worker)}><DeleteOutline /></IconButton>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button className="fab" onClick={() => nav('/workers/add')} variant="contained" startIcon={<Add />}>Add Worker</Button>
      <Dialog open={!!confirm} onClose={() => setConfirm(null)}>
        <DialogTitle>Delete worker?</DialogTitle>
        <DialogContent>Remove {confirm?.name} from this workspace? This is a demo action.</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => setConfirm(null)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
