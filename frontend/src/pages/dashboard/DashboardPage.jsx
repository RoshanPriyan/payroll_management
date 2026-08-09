import { Avatar, Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { Assessment, CalendarMonth, ChevronRight, Groups, Paid, Payments, PersonAdd, Wallet } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SectionHead from '../../components/common/SectionHead.jsx';

const Sparkline = ({ points }) => <svg className="dashSpark" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points={points} /></svg>;

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

function PayCardArt() {
  return (
    <svg viewBox="0 0 320 220" className="payCardArt" aria-hidden="true">
      <defs>
        <linearGradient id="dashCardGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="dashWaveGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2563EB" stopOpacity=".18" />
          <stop offset="1" stopColor="#10B981" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <path d="M0 150 Q 60 120 120 150 T 240 150 T 320 150 V220 H0 Z" fill="url(#dashWaveGradient)" />
      <path d="M0 150 Q 60 120 120 150 T 240 150 T 320 150" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" opacity=".45" />
      <g transform="translate(70,40)">
        <rect x="0" y="30" width="150" height="92" rx="14" fill="url(#dashCardGradient)" />
        <rect x="14" y="50" width="34" height="24" rx="4" fill="#FCD34D" />
        <rect x="14" y="88" width="60" height="8" rx="4" fill="#fff" opacity=".85" />
        <rect x="14" y="102" width="90" height="7" rx="3.5" fill="#fff" opacity=".5" />
        <circle cx="120" cy="60" r="16" fill="#fff" opacity=".15" />
      </g>
      <circle className="coin coinOne" cx="245" cy="55" r="16" fill="#F59E0B" />
      <text x="245" y="61" textAnchor="middle" fontSize="15" fill="#fff" fontWeight="700">₹</text>
      <circle className="coin coinTwo" cx="270" cy="90" r="11" fill="#10B981" />
      <text x="270" y="94.5" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700">₹</text>
      <circle className="coin coinThree" cx="40" cy="70" r="9" fill="#2563EB" />
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
  const userInfo = getUserInfo();
  const { day, shortDate, fullDate } = getDashboardDate();
  const ownerName = [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' ') || 'User';
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

  return (
    <Box className="page dashboardPage">
      <Card className="dashCard welcomeCard">
        <CardContent>
          <Box className="welcomeText">
            <Typography className="eyebrow">{day} overview</Typography>
            <Typography variant="h4">
              <b>Welcome back,</b> <Box component="span" sx={{ fontWeight: 400 }}>{ownerName}</Box>
            </Typography>
            <Typography className="welcomeSub">Here's how your team is doing today, {fullDate}.</Typography>
            <Typography className="welcomeSummary">You have <b>8 pending salary payments</b> and <b>42 workers present</b> today.</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button variant="contained" endIcon={<ChevronRight />} onClick={() => nav('/daily-payments')}>Process payments</Button>
              <Button variant="outlined" onClick={() => nav('/attendance')}>Mark attendance</Button>
            </Stack>
          </Box>
          <Box className="welcomeArt"><PayCardArt /></Box>
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
            <SectionHead title="Attendance overview" sub="Present vs. absent - last 7 days" action={<Stack direction="row" gap={2} className="legend"><span><i className="dot greenDot" />Present</span><span><i className="dot orangeDot" />Absent</span></Stack>} />
            <Box className="attendanceBars">
              {[38, 41, 39, 44, 40, 36, 42].map((present, index) => (
                <Box className="dayGroup" key={index}>
                  <Box className="barPair">
                    <span className="presentBar" style={{ height: present * 4 }} />
                    <span className="absentBar" style={{ height: [6, 4, 7, 3, 5, 9, 8][index] * 10 }} />
                  </Box>
                  <Typography>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</Typography>
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
