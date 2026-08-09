const stats = [
  {
    icon: 'fa-solid fa-users',
    title: 'Total Employees',
    value: '248',
    note: '4.2% this month',
    tone: 'blue',
  },
  {
    icon: 'fa-solid fa-user-check',
    title: 'Present Today',
    value: '231',
    note: '94% attendance',
    tone: 'green',
  },
  {
    icon: 'fa-solid fa-indian-rupee-sign',
    title: 'Monthly Payroll',
    value: '\u20B986.4L',
    note: 'across 248 employees',
    tone: 'purple',
  },
  {
    icon: 'fa-solid fa-hourglass-half',
    title: 'Pending Payments',
    value: '17',
    note: 'Needs approval',
    tone: 'amber',
  },
];

export default function DashboardPreview() {
  return (
    <section className="section-pad dashboard-preview-section">
      <div className="container text-center">
        <div className="reveal">
          <div className="eyebrow">Dashboard</div>
          <h2 className="section-title mt-2">A real-time view of your payroll</h2>
          <p className="section-sub mt-3">Everything at a glance, no spreadsheets required.</p>
        </div>

        <div className="landing-grid dashboard-grid mt-4">
          {stats.map((stat) => (
            <article className="dash-stat-card reveal" key={stat.title}>
              <div className={`dash-icon dash-icon-${stat.tone}`}>
                <i className={stat.icon} aria-hidden="true" />
              </div>
              <div className="text-muted-custom">{stat.title}</div>
              <strong>{stat.value}</strong>
              <small className={stat.tone === 'green' ? 'text-success' : stat.tone === 'amber' ? 'text-warning' : 'text-muted-custom'}>
                {stat.tone === 'green' && <i className="fa-solid fa-arrow-up" aria-hidden="true"></i>}
                {stat.tone === 'amber' && <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>}
                {stat.note}
              </small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
