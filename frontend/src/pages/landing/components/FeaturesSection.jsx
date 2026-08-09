const features = [
  {
    icon: 'fa-solid fa-fingerprint',
    title: 'Attendance Tracking',
    description: 'Real-time check-ins, leave, and shift tracking for every employee.',
  },
  {
    icon: 'fa-solid fa-users',
    title: 'Employee Management',
    description: 'Centralized employee profiles, documents, and role management.',
  },
  {
    icon: 'fa-solid fa-indian-rupee-sign',
    title: 'Daily Wage Processing',
    description: 'Automated daily wage calculations for hourly and contract staff.',
  },
  {
    icon: 'fa-solid fa-calendar-week',
    title: 'Weekly Payroll',
    description: 'Run and approve weekly payroll cycles in just a few clicks.',
  },
  {
    icon: 'fa-solid fa-file-invoice',
    title: 'Monthly Salary Management',
    description: 'Structured monthly salary runs with deductions and bonuses.',
  },
  {
    icon: 'fa-solid fa-chart-pie',
    title: 'Payroll Reports',
    description: 'Exportable, audit-ready payroll and compliance reports.',
  },
  {
    icon: 'fa-solid fa-building',
    title: 'Multi-Tenant Support',
    description: 'Manage multiple businesses or branches from a single account.',
  },
  {
    icon: 'fa-solid fa-lock',
    title: 'Secure Authentication',
    description: 'Role-based access with encrypted, secure login sessions.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="section-pad">
      <div className="container text-center">
        <div className="reveal">
          <div className="eyebrow">Features</div>
          <h2 className="section-title mt-2">Everything you need to run payroll</h2>
          <p className="section-sub mt-3">A complete toolkit built for growing teams, from attendance to final payout.</p>
        </div>

        <div className="landing-grid features-grid mt-4">
          {features.map((feature) => (
            <article className="glass-card reveal" key={feature.title}>
              <div className="feature-icon">
                <i className={feature.icon} aria-hidden="true" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
