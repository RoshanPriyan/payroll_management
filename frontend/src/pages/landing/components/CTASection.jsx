export default function CTASection({ onOpenModal }) {
  return (
    <section className="section-pad">
      <div className="container reveal">
        <div className="cta-section">
          <h2>Start Managing Payroll Smarter Today</h2>
          <p>Join thousands of businesses simplifying their payroll with PayrollPro.</p>
          <button
            type="button"
            className="btn-light-hero mt-3"
            onClick={() => onOpenModal('register')}
          >
            <i className="fa-solid fa-user-plus" aria-hidden="true" />
            Create Free Account
          </button>
        </div>
      </div>
    </section>
  );
}
