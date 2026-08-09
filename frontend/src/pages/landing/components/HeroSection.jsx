export default function HeroSection({ onOpenModal }) {
  return (
    <header className="hero">
      <div className="container position-relative">
        <div className="hero-grid">
          <div className="reveal">
            <span className="hero-badge mb-3">
              <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
              Trusted by 2,000+ Indian businesses
            </span>
            <h1 className="mt-3">Simplify Payroll Management for Your Business</h1>
            <p className="lead-custom mt-3">
              Manage attendance, daily wages, weekly payroll, monthly salaries, and employee records from one secure platform.
            </p>
            <div className="hero-actions mt-4">
              <button className="btn-light-hero" type="button" onClick={() => onOpenModal('register')}>
                <i className="fa-solid fa-rocket" aria-hidden="true"></i>
                Start Free Trial
              </button>
              <button className="btn-outline-hero" type="button" onClick={() => onOpenModal('login')}>
                <i className="fa-solid fa-right-to-bracket" aria-hidden="true"></i>
                Login
              </button>
            </div>
            <div className="hero-trust-list mt-5">
              <div>
                <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
                No credit card required
              </div>
              <div>
                <i className="fa-solid fa-check-circle" aria-hidden="true"></i>
                30-day free trial
              </div>
            </div>
          </div>

          <div className="mockup-wrap reveal">
            <div className="mockup-card">
              <div className="mockup-head mb-3">
                <div>
                  <i className="fa-solid fa-chart-line" aria-hidden="true"></i>
                  Payroll Dashboard
                </div>
                <span className="badge bg-light">Live</span>
              </div>

              <div className="mockup-stat-grid mb-3">
                <div className="mockup-stat">
                  <small className="opacity-75">Employees</small>
                  <div className="fs-4 fw-bold">248</div>
                </div>
                <div className="mockup-stat">
                  <small className="opacity-75">Payroll (Mo.)</small>
                  <div className="fs-4 fw-bold">{'\u20B9'}86.4L</div>
                </div>
              </div>

              <div className="mockup-stat mb-2">
                <div className="mockup-row mb-1">
                  <small>Attendance</small>
                  <small>94%</small>
                </div>
                <div className="mockup-bar"><span style={{ width: '94%' }}></span></div>
              </div>
              <div className="mockup-stat mb-2">
                <div className="mockup-row mb-1">
                  <small>Payroll Processed</small>
                  <small>78%</small>
                </div>
                <div className="mockup-bar"><span style={{ width: '78%' }}></span></div>
              </div>
              <div className="mockup-stat">
                <div className="mockup-row mb-1">
                  <small>Pending Approvals</small>
                  <small>12%</small>
                </div>
                <div className="mockup-bar"><span style={{ width: '12%' }}></span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
