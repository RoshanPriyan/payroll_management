import { useEffect, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Assessment, CalendarMonth, Groups, Paid, Payments, PersonAdd, Wallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { workerApi } from '../../api/workerApi.js';
import SectionHead from '../../components/common/SectionHead.jsx';

const Sparkline = ({ points }) => <svg className="dashSpark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points={points} /></svg>;

const attendanceSummaryFallback = {
  total_workers: null,
  present_count: null,
  absent_count: null,
  half_day_count: null,
};

const attendanceOverviewLegend = [
  ['Present', 'greenDot'],
  ['Absent', 'redDot'],
  ['Half Day', 'orangeDot'],
];

function toCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

function getLocalDateValue(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 10);
}

function formatWeeklyDateLabel(dateValue) {
  const [year, month, day] = String(dateValue).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-IN', { weekday: 'short' });
}

function buildWeeklyFallback() {
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));

    return {
      date: getLocalDateValue(date),
      day: formatWeeklyDateLabel(getLocalDateValue(date)),
      present: 0,
      absent: 0,
      halfDay: 0,
    };
  });
}

function normalizeWeeklyAttendance(items) {
  if (!Array.isArray(items) || items.length === 0) return buildWeeklyFallback();

  return items.map((item) => ({
    date: item.date,
    day: formatWeeklyDateLabel(item.date),
    present: toCount(item.present),
    absent: toCount(item.absent),
    halfDay: toCount(item.half_day),
  }));
}

function getAttendanceBarHeight(value, maxValue) {
  if (!value || !maxValue) return 0;
  return Math.max(14, Math.round((value / maxValue) * 180));
}

function buildHeroStats(summary) {
  return [
    { label: 'Total Workers', value: summary.total_workers, tone: 'slate', icon: <Groups /> },
    { label: 'Present Today', value: summary.present_count, tone: 'green' },
    { label: 'Absent Today', value: summary.absent_count, tone: 'red' },
    { label: 'Half Day', value: summary.half_day_count, tone: 'amber' },
  ];
}

function formatStatValue(value) {
  return value ?? '-';
}

function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('user_info') || '{}');
  } catch {
    return {};
  }
}

function getDashboardDate() {
  const today = new Date();

  return {
    day: today.toLocaleDateString('en-IN', { weekday: 'long' }),
    shortDate: today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
    fullDate: today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
  };
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

const DashboardKpi = ({ tone, icon, value, label, trend, points }) => (
  <Card className={`dashCard kpiCard ${tone}`}>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box className="kpiIcon">{icon}</Box>
        <Box className={`kpiTrend ${trend.includes('workers') ? 'neutral' : 'up'}`}>{trend}</Box>
      </Stack>
      <Typography className="kpiValue">{value}</Typography>
      <Typography className="kpiLabel">{label}</Typography>
      <Sparkline points={points} />
    </CardContent>
  </Card>
);

function DashboardHeroArt() {
  return (
    <svg viewBox="0 0 360 160" className="dashboardHeroArt" aria-hidden="true">
      <defs>
        <linearGradient id="heroCardTop" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563EB" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="heroFloor" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#DBEAFE" stopOpacity=".22" />
          <stop offset="1" stopColor="#C7D2FE" stopOpacity=".65" />
        </linearGradient>
      </defs>
      <ellipse cx="240" cy="130" rx="118" ry="28" fill="url(#heroFloor)" />
      <g transform="translate(112,18)">
        <rect x="34" y="0" width="145" height="112" rx="10" fill="#fff" filter="drop-shadow(0 14px 24px rgba(37,99,235,.12))" />
        <rect x="34" y="0" width="145" height="18" rx="10" fill="url(#heroCardTop)" />
        <circle cx="49" cy="9" r="2.2" fill="#93C5FD" />
        <circle cx="58" cy="9" r="2.2" fill="#93C5FD" />
        <circle cx="67" cy="9" r="2.2" fill="#93C5FD" />
        <circle cx="60" cy="44" r="15" fill="#3B82F6" opacity=".9" />
        <path d="M51 57c5-8 14-8 19 0" fill="#DBEAFE" />
        <circle cx="60" cy="39" r="6" fill="#DBEAFE" />
        <rect x="85" y="35" width="46" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="85" y="50" width="72" height="5" rx="2.5" fill="#E2E8F0" />
        <rect x="49" y="77" width="35" height="4" rx="2" fill="#E2E8F0" />
        <rect x="49" y="91" width="54" height="4" rx="2" fill="#E2E8F0" />
        <rect x="114" y="82" width="6" height="28" rx="3" fill="#DBEAFE" />
        <rect x="128" y="93" width="6" height="17" rx="3" fill="#C7D2FE" />
        <rect x="142" y="88" width="6" height="22" rx="3" fill="#DBEAFE" />
        <rect x="156" y="78" width="6" height="32" rx="3" fill="#C7D2FE" />
      </g>
      <g transform="translate(62,48)">
        <path d="M32 55c-12-20-7-42 11-56 12 25 7 44-11 56Z" fill="#93C5FD" opacity=".8" />
        <path d="M47 58c-1-23 12-40 34-48 0 27-12 42-34 48Z" fill="#60A5FA" opacity=".72" />
        <path d="M52 71c5-21 21-32 43-33-8 24-23 35-43 33Z" fill="#BFDBFE" />
        <rect x="34" y="70" width="38" height="26" rx="4" fill="#93C5FD" />
        <path d="M31 70h44l-4 10H35Z" fill="#2563EB" opacity=".65" />
      </g>
      <g transform="translate(276,46)">
        <circle cx="38" cy="25" r="23" fill="#EEF2FF" stroke="#A5B4FC" strokeWidth="3" />
        <path d="M38 13v14l10 7" fill="none" stroke="#93A4F8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="7" y="55" width="60" height="48" rx="7" fill="#fff" filter="drop-shadow(0 12px 18px rgba(37,99,235,.12))" />
        <rect x="7" y="55" width="60" height="13" rx="7" fill="#3B82F6" />
        <rect x="17" y="49" width="5" height="13" rx="2.5" fill="#1D4ED8" />
        <rect x="52" y="49" width="5" height="13" rx="2.5" fill="#1D4ED8" />
        <rect x="18" y="77" width="7" height="5" rx="1" fill="#CBD5E1" />
        <rect x="33" y="77" width="7" height="5" rx="1" fill="#CBD5E1" />
        <rect x="48" y="77" width="7" height="5" rx="1" fill="#CBD5E1" />
        <rect x="18" y="90" width="7" height="5" rx="1" fill="#CBD5E1" />
        <rect x="33" y="90" width="7" height="5" rx="1" fill="#CBD5E1" />
        <rect x="48" y="90" width="7" height="5" rx="1" fill="#CBD5E1" />
      </g>
    </svg>
  );
}

function DashboardAttendance({ todayLabel }) {
  const rows = [
    ['RS', 'Ravi Shankar', 'Present', '9:02 AM', 'Daily', '#DBEAFE', '#2563EB'],
    ['PK', 'Priya Kumari', 'Present', '8:47 AM', 'Monthly', '#FCE7F3', '#DB2777'],
    ['SM', 'Suresh Mani', 'Half day', '1:10 PM', 'Daily', '#FEF3C7', '#B45309'],
    ['KV', 'Karthik Velu', 'Absent', '-', 'Weekly', '#FEE2E2', '#DC2626'],
    ['LN', 'Lakshmi Narayan', 'Present', '9:15 AM', 'Weekly', '#DCFCE7', '#16A34A'],
  ];

  return (
    <Card className="dashCard tableCard">
      <CardContent>
        <SectionHead title="Recent attendance" sub={`Today, ${todayLabel}`} action={<Button size="small">View all</Button>} />
        <Box className="tableScroll">
          <table className="dashTable">
            <thead><tr><th>Worker</th><th>Status</th><th>Check-in</th><th>Salary type</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[1]}>
                  <td><span className="workerCell"><span className="dashAvatar" style={{ background: row[5], color: row[6] }}>{row[0]}</span>{row[1]}</span></td>
                  <td><span className={`dashBadge ${row[2] === 'Present' ? 'badgeSuccess' : row[2] === 'Half day' ? 'badgeWarning' : 'badgeDanger'}`}>{row[2]}</span></td>
                  <td>{row[3]}</td>
                  <td>{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </CardContent>
    </Card>
  );
}

function DashboardPayments() {
  const rows = [
    ['AS', 'Amit Sharma', 'Daily wage', '25 Jul', '₹850', 'UPI', '#DBEAFE', '#2563EB'],
    ['PS', 'Priya Singh', 'Monthly salary', '24 Jul', '₹22,000', 'Bank transfer', '#FCE7F3', '#DB2777'],
    ['RV', 'Rohan Verma', 'Daily wage', '24 Jul', '₹700', 'Cash', '#FEF3C7', '#B45309'],
    ['SP', 'Sneha Patel', 'Weekly wage', '23 Jul', '₹4,200', 'UPI', '#EDE9FE', '#7C3AED'],
    ['VY', 'Vikas Yadav', 'Weekly wage', '22 Jul', '₹3,950', 'UPI', '#DCFCE7', '#16A34A'],
  ];

  return (
    <Card className="dashCard tableCard">
      <CardContent>
        <SectionHead title="Recent payments" sub="Last 5 transactions" action={<Button size="small">View all</Button>} />
        <ul className="paymentList">
          {rows.map((row) => (
            <li key={row[1]}>
              <span className="dashAvatar" style={{ background: row[6], color: row[7] }}>{row[0]}</span>
              <Box className="paymentMid">
                <b>{row[1]}</b>
                <Typography className="muted">{row[2]} · {row[3]}</Typography>
              </Box>
              <Box className="paymentRight">
                <b>{row[4]}</b>
                <span className="dashBadge badgeMode">{row[5]}</span>
              </Box>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function DashboardWidgets() {
  return (
    <Box className="dashBlock">
      <SectionHead title="Smart widgets" />
      <Box className="widgetGrid">
        <Card className="dashCard widgetCard">
          <CardContent>
            <Typography className="widgetLabel">Today's payroll summary</Typography>
            <Typography className="widgetValue">₹42,900</Typography>
            <Box className="progress"><span style={{ width: '64%' }} /></Box>
            <Stack direction="row" justifyContent="space-between">
              <Typography className="muted">₹27,450 paid</Typography>
              <Typography className="muted">₹15,450 left</Typography>
            </Stack>
          </CardContent>
        </Card>
        <Card className="dashCard widgetCard">
          <CardContent>
            <Typography className="widgetLabel">Upcoming weekly payments</Typography>
            <Typography className="widgetValue">₹64,200</Typography>
            <Typography className="widgetSub"><CalendarMonth fontSize="small" />Due Fri, 31 Jul · 9 workers</Typography>
          </CardContent>
        </Card>
        <Card className="dashCard widgetCard">
          <CardContent>
            <Typography className="widgetLabel">Upcoming monthly payments</Typography>
            <Typography className="widgetValue">₹3,10,000</Typography>
            <Typography className="widgetSub"><CalendarMonth fontSize="small" />Due 1 Aug · 14 workers</Typography>
          </CardContent>
        </Card>
        <Card className="dashCard widgetCard">
          <CardContent>
            <Typography className="widgetLabel">Needs payment today</Typography>
            {['Amit Sharma', 'Rohan Verma', 'Sneha Patel'].map((name, index) => (
              <Stack direction="row" alignItems="center" gap={1} className="payChip" key={name}>
                <Avatar sx={{ width: 26, height: 26, fontSize: 11, bgcolor: ['#DBEAFE', '#FEF3C7', '#EDE9FE'][index], color: ['#2563EB', '#B45309', '#7C3AED'][index] }}>
                  {name.split(' ').map((part) => part[0]).join('')}
                </Avatar>
                <Typography>{name}</Typography>
                <Button size="small">Pay</Button>
              </Stack>
            ))}
          </CardContent>
        </Card>
      </Box>
      <Card className="dashCard emptyDashboard">
        <CardContent>
          <Assessment />
          <Typography variant="h6">No overtime requests pending</Typography>
          <Typography className="muted">You're all caught up. New requests from your team will show up here as soon as they come in.</Typography>
          <Button variant="outlined">Set up overtime rules</Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function DashboardPage() {
  const nav = useNavigate();
  const [attendanceSummary, setAttendanceSummary] = useState(attendanceSummaryFallback);
  const [weeklyAttendance, setWeeklyAttendance] = useState(() => buildWeeklyFallback());
  const userInfo = getUserInfo();
  const { day, shortDate, fullDate } = getDashboardDate();
  const ownerName = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') || 'User';
  const dashboardDateLabel = `${day}, ${fullDate}`;
  const heroStats = buildHeroStats(attendanceSummary);
  const kpis = [
    { tone: 'success', icon: <Groups />, value: '42', label: 'Workers present today', trend: '6%', points: '0,22 15,20 30,24 45,14 60,16 75,8 100,6' },
    { tone: 'warning', icon: <Groups />, value: '8', label: 'Workers absent today', trend: '2%', points: '0,10 15,14 30,9 45,18 60,15 75,22 100,24' },
    { tone: 'danger', icon: <Paid />, value: '₹18,400', label: 'Pending daily payments', trend: '12 workers', points: '0,6 15,12 30,10 45,20 60,17 75,25 100,23' },
    { tone: 'primary', icon: <Wallet />, value: '₹64,200', label: 'Pending weekly payments', trend: '9 workers', points: '0,20 15,18 30,22 45,12 60,14 75,7 100,10' },
  ];
  const quick = [
    ['Add worker', <PersonAdd />, 'blue', () => nav('/workers/add')],
    ['Mark attendance', <CalendarMonth />, 'green', () => nav('/attendance')],
    ['Process payment', <Payments />, 'orange', () => nav('/daily-payments')],
    ['Generate payroll', <Wallet />, 'purple', () => nav('/weekly-payments')],
    ['View reports', <Assessment />, 'slate', () => nav('/reports')],
  ];
  const maxAttendanceCount = Math.max(
    0,
    ...weeklyAttendance.flatMap((item) => [item.present, item.absent, item.halfDay]),
  );

  useEffect(() => {
    let isActive = true;

    workerApi.getAttendanceSummary()
      .then((response) => {
        if (!isActive) return;
        setAttendanceSummary({
          ...attendanceSummaryFallback,
          ...(response.data?.data || {}),
        });
      })
      .catch((error) => {
        console.error('Failed to fetch attendance summary', error);
      });

    workerApi.getWeeklyAttendanceSummary()
      .then((response) => {
        if (!isActive) return;
        setWeeklyAttendance(normalizeWeeklyAttendance(response.data?.data));
      })
      .catch((error) => {
        console.error('Failed to fetch weekly attendance summary', error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <Box className="page dashboardPage">
      <Card className="dashCard welcomeCard">
        <CardContent>
          <Box className="welcomeText">
            <Typography variant="h4">{getGreeting()}, {ownerName}</Typography>
            <Typography className="welcomeDate"><CalendarMonth />{dashboardDateLabel}</Typography>
            <Box className="welcomeStats">
              {heroStats.map((stat) => (
                <Box className="welcomeStat" key={stat.label}>
                  <span className={`welcomeStatIcon ${stat.tone}`}>
                    {stat.icon || <i />}
                  </span>
                  <span>
                    <b>{formatStatValue(stat.value)}</b>
                    <Typography>{stat.label}</Typography>
                  </span>
                </Box>
              ))}
            </Box>
          </Box>
          <Box className="welcomeArt"><DashboardHeroArt /></Box>
        </CardContent>
      </Card>
      <Box className="kpiGrid">{kpis.map((kpi) => <DashboardKpi key={kpi.label} {...kpi} />)}</Box>
      <Box className="dashBlock">
        <SectionHead title="Quick actions" />
        <Box className="quickGrid">
          {quick.map(([label, icon, tone, action]) => (
            <button type="button" className="quickCard" key={label} onClick={action}>
              <span className={`quickIcon ${tone}`}>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </Box>
      </Box>
      <Box className="analyticsGrid">
        <Card className="dashCard chartCard">
          <CardContent>
            <SectionHead
              title="Attendance overview"
              sub="Status breakdown - last 7 days"
              action={(
                <Stack direction="row" gap={2} className="legend">
                  {attendanceOverviewLegend.map(([label, dotClass]) => (
                    <span key={label}><i className={`dot ${dotClass}`} />{label}</span>
                  ))}
                </Stack>
              )}
            />
            <Box className="attendanceBars">
              {weeklyAttendance.map((day) => (
                <Box className="dayGroup" key={day.date}>
                  <Box className="barPair">
                    <span className="presentBar" style={{ height: getAttendanceBarHeight(day.present, maxAttendanceCount) }} />
                    <span className="absentBar" style={{ height: getAttendanceBarHeight(day.absent, maxAttendanceCount) }} />
                    <span className="halfDayBar" style={{ height: getAttendanceBarHeight(day.halfDay, maxAttendanceCount) }} />
                  </Box>
                  <Typography>{day.day}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
        <Card className="dashCard chartCard">
          <CardContent>
            <SectionHead title="Payment distribution" sub="By salary type this month" />
            <Box className="dashDonut">
              <Box>
                <b>₹2.4L</b>
                <Typography className="muted">total paid</Typography>
              </Box>
            </Box>
            <Stack gap={1.4} className="donutLegend">
              {[
                ['Daily wages', '#2563EB', '45%'],
                ['Weekly wages', '#10B981', '35%'],
                ['Monthly salary', '#F59E0B', '20%'],
              ].map((item) => (
                <Stack direction="row" alignItems="center" gap={1} key={item[0]}>
                  <i className="dot" style={{ background: item[1] }} />
                  <Typography>{item[0]}</Typography>
                  <b>{item[2]}</b>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
      <Box className="tablesGrid">
        <DashboardAttendance todayLabel={shortDate} />
        <DashboardPayments />
      </Box>
      <DashboardWidgets />
    </Box>
  );
}

