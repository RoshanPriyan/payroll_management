const plans = [
  {
    name: 'Free Plan',
    price: '\u20B90',
    suffix: '/mo',
    description: 'Perfect for trying things out',
    features: ['10 Employees', 'Attendance Tracking', 'Basic Payroll', '30-Day Trial'],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Standard Plan',
    price: '\u20B9499',
    suffix: '/mo',
    description: 'For growing businesses',
    features: ['Unlimited Employees', 'Payroll Reports', 'Analytics Dashboard', 'Priority Support'],
    cta: 'Choose Plan',
    featured: true,
  },
];

export default function PricingSection({ onOpenModal }) {
  return (
    <section id="pricing" className="section-pad">
      <div className="container text-center">
        <div className="reveal">
          <div className="eyebrow">Pricing</div>
          <h2 className="section-title mt-2">Simple, transparent pricing</h2>
          <p className="section-sub mt-3">Choose a plan that fits your business and upgrade anytime.</p>
        </div>

        <div className="landing-grid pricing-grid mt-4">
          {plans.map((plan) => (
            <article className={`pricing-card reveal ${plan.featured ? 'featured' : ''}`} key={plan.name}>
              {plan.featured && <div className="pricing-badge">POPULAR</div>}
              <h3>{plan.name}</h3>
              <div className="price-amount">
                {plan.price}
                <small>{plan.suffix}</small>
              </div>
              <p>{plan.description}</p>
              <ul className="pricing-list">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <i className="fa-solid fa-circle-check" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className={`${plan.featured ? 'btn-light-hero' : 'btn-outline-custom'} w-100 mt-3`}
                onClick={() => onOpenModal('register')}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
