import { useState, useEffect } from 'react';

export default function Navbar({ theme, onToggleTheme, onOpenModal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar-custom ${isScrolled ? 'scrolled' : ''}`} id="mainNav">
      <div className="container nav-container">
        <a href="#" className="brand-logo">
          <i className="fa-solid fa-indian-rupee-sign"></i>
          Payroll<span>Pro</span>
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>

        <div className={`nav-menu ${isMenuOpen ? 'open' : ''}`} id="navMenu">
          <div className="nav-links">
            <a href="#features" className="nav-link-custom" onClick={closeMenu}>Features</a>
            <a href="#pricing" className="nav-link-custom" onClick={closeMenu}>Pricing</a>
            <a href="#contact" className="nav-link-custom" onClick={closeMenu}>Contact</a>
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={onToggleTheme}
              title="Toggle dark mode"
              type="button"
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
            <button
              className="btn-outline-custom"
              type="button"
              onClick={() => {
                closeMenu();
                onOpenModal('login');
              }}
            >
              Login
            </button>
            <button
              className="btn-outline-custom"
              type="button"
              onClick={() => {
                closeMenu();
                onOpenModal('register');
              }}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
