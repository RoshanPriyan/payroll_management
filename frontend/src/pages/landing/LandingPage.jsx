import { useEffect, useState } from 'react';
import AuthModal from '../../components/auth/AuthModal.jsx';
import CTASection from './components/CTASection.jsx';
import DashboardPreview from './components/DashboardPreview.jsx';
import FeaturesSection from './components/FeaturesSection.jsx';
import Footer from './components/Footer.jsx';
import HeroSection from './components/HeroSection.jsx';
import HowItWorksSection from './components/HowItWorksSection.jsx';
import Navbar from './components/Navbar.jsx';
import PricingSection from './components/PricingSection.jsx';
import TestimonialsSection from './components/TestimonialsSection.jsx';
import '../../styles/landing.css';

export default function LandingPage({ initialModalMode = null }) {
  const [theme, setTheme] = useState(() => {
    try {
      return window.localStorage.getItem('payrollpro-theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [modalMode, setModalMode] = useState(initialModalMode);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try {
      window.localStorage.setItem('payrollpro-theme', theme);
    } catch {
      // Theme persistence is optional.
    }
  }, [theme]);

  useEffect(() => {
    const revealElements = document.querySelectorAll('.landing-page .reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
        onOpenModal={setModalMode}
      />
      <HeroSection onOpenModal={setModalMode} />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection onOpenModal={setModalMode} />
      <DashboardPreview />
      <TestimonialsSection />
      <CTASection onOpenModal={setModalMode} />
      <Footer />
      {modalMode && <AuthModal key={modalMode} mode={modalMode} onClose={() => setModalMode(null)} onSwitch={setModalMode} />}
    </div>
  );
}
