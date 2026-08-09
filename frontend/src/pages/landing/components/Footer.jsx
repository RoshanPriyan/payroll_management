const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Integrations', href: '#' },
      { label: 'Updates', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="brand-logo" href="/">
              <i className="fa-solid fa-indian-rupee-sign" aria-hidden="true"></i>
              Payroll<span>Pro</span>
            </a>
            <p>The all-in-one payroll management platform for modern, growing businesses.</p>
            <div className="social-list mt-3">
              <a className="social-icon" href="https://facebook.com" aria-label="Facebook">
                <i className="fa-brands fa-facebook-f" aria-hidden="true" />
              </a>
              <a className="social-icon" href="https://twitter.com" aria-label="Twitter">
                <i className="fa-brands fa-twitter" aria-hidden="true" />
              </a>
              <a className="social-icon" href="https://linkedin.com" aria-label="LinkedIn">
                <i className="fa-brands fa-linkedin-in" aria-hidden="true" />
              </a>
              <a className="social-icon" href="https://instagram.com" aria-label="Instagram">
                <i className="fa-brands fa-instagram" aria-hidden="true" />
              </a>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h6>{column.title}</h6>
              {column.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          ))}

          <div>
            <h6>Contact</h6>
            <a href="mailto:support@payrollpro.in">
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
              support@payrollpro.in
            </a>
            <a href="tel:+910000000000">
              <i className="fa-solid fa-phone" aria-hidden="true"></i>
              +91 XXXXX XXXXX
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} PayrollPro. All rights reserved.</div>
          <div>Built for modern businesses, everywhere.</div>
        </div>
      </div>
    </footer>
  );
}
