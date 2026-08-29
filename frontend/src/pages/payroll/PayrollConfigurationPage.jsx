import {
  AccessTime,
  CalendarMonth,
  EventRepeat,
  FactCheck,
  Paid,
  Payments,
  RestartAlt,
  Save,
  Schedule,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import payrollConfiguration from '../../data/payrollConfiguration.json';
import '../../styles/payrollConfiguration.css';

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const monthDays = Array.from({ length: 31 }, (_, index) => index + 1);

function formatTime(value) {
  if (!value) return '-';

  const [hourValue, minuteValue] = value.split(':').map(Number);
  const date = new Date();

  date.setHours(hourValue, minuteValue, 0, 0);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatOrdinal(value) {
  const day = Number(value);

  if (!day) return '-';

  if ([11, 12, 13].includes(day % 100)) return `${day}th`;

  const suffix = {
    1: 'st',
    2: 'nd',
    3: 'rd',
  }[day % 10] || 'th';

  return `${day}${suffix}`;
}

function formatCalculationMethod(value) {
  return value === 'CALENDAR_DAYS' ? 'Calendar Days' : 'Working Days';
}

function ConfigCard({ icon, title, children }) {
  return (
    <Card className="payrollConfigCard">
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" className="payrollConfigCardHead">
          <span>{icon}</span>
          <Typography variant="h6">{title}</Typography>
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function SwitchField({ control, name, label }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          className="payrollSwitchRow"
          label={label}
          control={
            <Switch
              checked={Boolean(field.value)}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          }
        />
      )}
    />
  );
}

function SelectField({ control, name, label, options }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth>
          <FormLabel>{label}</FormLabel>
          <Select {...field} size="small">
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    />
  );
}

function TextInputField({ control, name, label, type = 'text', inputProps }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          fullWidth
          size="small"
          type={type}
          label={label}
          inputProps={inputProps}
        />
      )}
    />
  );
}

export default function PayrollConfigurationPage() {
  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: payrollConfiguration,
  });

  const values = useWatch({ control });
  const monthlyMethod = values?.monthly?.method;

  const onSubmit = (formValues) => {
    console.log('Payroll configuration saved', formValues);
  };

  const handleReset = () => {
    reset(payrollConfiguration);
  };

  return (
    <Box className="page payrollConfigPage">
      <Box className="payrollConfigTitle">
        <Typography variant="h5">Payroll Configuration</Typography>
        <Typography className="muted">
          Configure payroll rules and payout schedules for your business.
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<Paid />} title="Daily Payout">
              <Stack spacing={2.25}>
                <SwitchField control={control} name="daily.enabled" label="Enable Daily Payout" />
                <TextInputField control={control} name="daily.payout_time" label="Payout Time" type="time" />
              </Stack>
            </ConfigCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<EventRepeat />} title="Weekly Payout">
              <Stack spacing={2.25}>
                <SwitchField control={control} name="weekly.enabled" label="Enable Weekly Payout" />
                <SelectField control={control} name="weekly.week_start_day" label="Week Start Day" options={weekDays} />
                <SelectField control={control} name="weekly.payout_day" label="Payout Day" options={weekDays} />
                <TextInputField control={control} name="weekly.payout_time" label="Payout Time" type="time" />
              </Stack>
            </ConfigCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<CalendarMonth />} title="Monthly Payout">
              <Stack spacing={2.25}>
                <SwitchField control={control} name="monthly.enabled" label="Enable Monthly Payout" />
                <Controller
                  name="monthly.method"
                  control={control}
                  render={({ field }) => (
                    <FormControl>
                      <FormLabel>Payout Method</FormLabel>
                      <RadioGroup {...field}>
                        <FormControlLabel value="FIXED_DATE" control={<Radio />} label="Fixed Date" />
                        <FormControlLabel value="JOINING_DATE" control={<Radio />} label="Employee Joining Date" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
                {monthlyMethod === 'FIXED_DATE' && (
                  <>
                    <SelectField
                      control={control}
                      name="monthly.salary_credit_day"
                      label="Salary Credit Day"
                      options={monthDays}
                    />
                    <TextInputField control={control} name="monthly.payout_time" label="Payout Time" type="time" />
                  </>
                )}
              </Stack>
            </ConfigCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<Payments />} title="Salary Calculation">
              <Controller
                name="salary_calculation.calculation_method"
                control={control}
                render={({ field }) => (
                  <FormControl>
                    <FormLabel>Calculation Method</FormLabel>
                    <RadioGroup {...field} className="payrollRadioStack">
                      <FormControlLabel
                        value="WORKING_DAYS"
                        control={<Radio />}
                        label={
                          <Box>
                            <b>Working Days</b>
                            <FormHelperText>Salary is calculated only for scheduled working days.</FormHelperText>
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="CALENDAR_DAYS"
                        control={<Radio />}
                        label={
                          <Box>
                            <b>Calendar Days</b>
                            <FormHelperText>Salary is calculated across every day in the month.</FormHelperText>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                )}
              />
            </ConfigCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<FactCheck />} title="Attendance Rules">
              <Stack spacing={2.25}>
                <TextInputField
                  control={control}
                  name="attendance_rules.grace_period"
                  label="Grace Period Minutes"
                  type="number"
                  inputProps={{ min: 0 }}
                />
                <TextInputField
                  control={control}
                  name="attendance_rules.half_day_after"
                  label="Half Day After Hours"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                />
                <SwitchField control={control} name="attendance_rules.overtime_enabled" label="Enable Overtime" />
              </Stack>
            </ConfigCard>
          </Grid>

          <Grid size={{ xs: 12, md: 6, xl: 4 }}>
            <ConfigCard icon={<Schedule />} title="Configuration Summary">
              <Stack spacing={1.5} className="payrollSummaryList">
                <Stack direction="row" spacing={1.25}>
                  <AccessTime fontSize="small" />
                  <Box>
                    <b>Daily Payout</b>
                    <Typography className="muted">Daily at {formatTime(values?.daily?.payout_time)}</Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.25}>
                  <EventRepeat fontSize="small" />
                  <Box>
                    <b>Weekly Payout</b>
                    <Typography className="muted">
                      Every {values?.weekly?.payout_day} at {formatTime(values?.weekly?.payout_time)}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.25}>
                  <CalendarMonth fontSize="small" />
                  <Box>
                    <b>Monthly Payout</b>
                    <Typography className="muted">
                      {monthlyMethod === 'FIXED_DATE'
                        ? `${formatOrdinal(values?.monthly?.salary_credit_day)} day of every month at ${formatTime(values?.monthly?.payout_time)}`
                        : 'On each employee joining date'}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.25}>
                  <Payments fontSize="small" />
                  <Box>
                    <b>Calculation</b>
                    <Typography className="muted">
                      {formatCalculationMethod(values?.salary_calculation?.calculation_method)}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1.25}>
                  <FactCheck fontSize="small" />
                  <Box>
                    <b>Grace Period</b>
                    <Typography className="muted">{values?.attendance_rules?.grace_period} Minutes</Typography>
                  </Box>
                </Stack>
              </Stack>
            </ConfigCard>
          </Grid>
        </Grid>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="payrollConfigActions">
          <Button type="submit" variant="contained" startIcon={<Save />}>
            Save Configuration
          </Button>
          <Button type="button" variant="outlined" startIcon={<RestartAlt />} onClick={handleReset}>
            Reset to Default
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
