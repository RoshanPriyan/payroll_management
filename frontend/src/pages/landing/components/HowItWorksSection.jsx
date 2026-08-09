const steps = [
  {
    number: 1,
    title: 'Register Business',
    description: 'Create your account and set up your company profile.',
  },
  {
    number: 2,
    title: 'Add Employees',
    description: 'Import or add your team members and assign roles.',
  },
  {
    number: 3,
    title: 'Track Attendance',
    description: 'Monitor daily attendance and working hours effortlessly.',
  },
  {
    number: 4,
    title: 'Generate Payroll',
    description: 'Run payroll and disburse salaries in one click.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="section-pad soft-gradient-section">
      <div className="container text-center">
        <div className="reveal">
          <div className="eyebrow">How It Works</div>
          <h2 className="section-title mt-2">Get started in four simple steps</h2>
        </div>

        <div className="landing-grid steps-grid mt-5">
          {steps.map((step) => (
            <article className="step-item reveal" key={step.number}>
              <div className="step-circle">{step.number}</div>
              <h6>{step.title}</h6>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
