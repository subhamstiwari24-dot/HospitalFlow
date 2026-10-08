import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronDown,
  HeartPulse,
  LayoutDashboard,
  Menu,
  MonitorSmartphone,
  Network,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Ticket,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: CalendarCheck2,
    title: 'Smart appointments',
    description: 'Coordinate visits with a clear, connected booking experience for every care team.',
    tone: 'blue',
  },
  {
    icon: Ticket,
    title: 'Digital tokens',
    description: 'Give patients a simple way to join the right queue and stay informed.',
    tone: 'cyan',
  },
  {
    icon: MonitorSmartphone,
    title: 'Real-time OPD queues',
    description: 'Make live queue progress visible across the patient and hospital experience.',
    tone: 'teal',
  },
  {
    icon: Building2,
    title: 'Hospital operations',
    description: 'Bring staff, departments, doctors, and patient workflows into one platform.',
    tone: 'blue',
  },
  {
    icon: Stethoscope,
    title: 'Doctor coordination',
    description: 'Help clinicians focus on care with organized schedules and queue context.',
    tone: 'cyan',
  },
  {
    icon: UserRound,
    title: 'Patient management',
    description: 'Deliver a calmer, more transparent journey from booking to consultation.',
    tone: 'teal',
  },
];

const highlights = [
  { icon: HeartPulse, label: 'Real-time OPD' },
  { icon: Ticket, label: 'Digital tokens' },
  { icon: CalendarCheck2, label: 'Smart appointments' },
  { icon: Network, label: 'Connected healthcare' },
];

const benefits = [
  'Efficient workflows for busy hospital teams',
  'Connected experiences across every care touchpoint',
  'Secure, role-based access for staff and patients',
  'Real-time visibility when queues are moving',
  'Patient-first design that reduces uncertainty',
  'A scalable foundation for growing operations',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="landing-page min-h-screen bg-white text-[#102A43]">
      <div className="landing-utility">
        <div className="landing-container landing-utility-inner">
          <span>HospitalFlow <b>|</b> Smart OPD Platform</span>
          <span className="landing-utility-secure"><ShieldCheck size={14} /> Secure Healthcare Platform</span>
        </div>
      </div>

      <header className="landing-navbar">
        <div className="landing-container landing-navbar-inner">
          <a href="#home" className="landing-brand" aria-label="HospitalFlow home">
            <span className="landing-brand-mark"><img src="/assets/logo.png" alt="" /></span>
            <span>
              <strong>Hospital<span>Flow</span></strong>
              <small>Smart OPD Platform</small>
            </span>
          </a>

          <nav className={`landing-nav-links ${mobileMenuOpen ? 'is-open' : ''}`} aria-label="Landing page navigation">
            <a href="#home" onClick={closeMobileMenu}>Home</a>
            <a href="#about" onClick={closeMobileMenu}>About</a>
            <a href="#features" onClick={closeMobileMenu}>Services</a>
            <a href="#contact" onClick={closeMobileMenu}>Contact</a>
            <button type="button" onClick={() => navigate('/hospital-portal')}>Get Started <ArrowRight size={15} /></button>
          </nav>

          <button
            type="button"
            className="landing-menu-toggle"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section id="home" className="landing-hero">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <div className="landing-eyebrow"><Sparkles size={15} /> SMART OPD PLATFORM</div>
              <h1>Smarter healthcare.<br /><span>Better flow.</span></h1>
              <p>
                HospitalFlow helps manage hospital operations, appointments, digital tokens,
                and real-time OPD queues from one connected platform.
              </p>
              <div className="landing-hero-actions">
                <button type="button" className="landing-button landing-button-primary" onClick={() => navigate('/hospital-portal')}>
                  Get Started <ArrowRight size={17} />
                </button>
                <a href="#access" className="landing-button landing-button-outline">
                  Explore HospitalFlow <ChevronDown size={16} />
                </a>
              </div>
              <div className="landing-hero-trust">
                <CheckCircle2 size={17} /> Designed for hospitals, doctors, and patients
              </div>
            </div>

            <div className="landing-hero-visual" aria-label="HospitalFlow operations overview">
              <div className="landing-visual-glow" />
              <div className="landing-visual-panel">
                <div className="landing-visual-header">
                  <div><span className="landing-status-dot" /> OPD overview</div>
                  <span>Live view</span>
                </div>
                <div className="landing-visual-main">
                  <div className="landing-visual-icon"><LayoutDashboard size={26} /></div>
                  <h2>Care that keeps moving</h2>
                  <p>One clear view for appointments, queues, and the people who make care happen.</p>
                </div>
                <div className="landing-visual-metrics">
                  {highlights.slice(0, 3).map(({ icon: Icon, label }) => (
                    <div key={label}><Icon size={17} /><span>{label}</span></div>
                  ))}
                </div>
              </div>
              <div className="landing-visual-float landing-visual-float-top"><BarChart3 size={18} /><span><b>Connected</b><small>hospital operations</small></span></div>
              <div className="landing-visual-float landing-visual-float-bottom"><Ticket size={18} /><span><b>Digital token</b><small>patient-ready flow</small></span></div>
            </div>
          </div>
        </section>

        <section id="access" className="landing-access landing-section">
          <div className="landing-container">
            <div className="landing-section-heading landing-centered-heading">
              <span className="landing-section-kicker">ACCESS HOSPITALFLOW</span>
              <h2>One platform. Two connected experiences.</h2>
              <p>Choose the experience that fits your role and move through healthcare with more clarity.</p>
            </div>
            <div className="landing-access-grid">
              <button type="button" className="landing-access-card landing-access-card-hospital" onClick={() => navigate('/hospital-portal')}>
                <span className="landing-access-icon"><Building2 size={27} /></span>
                <span className="landing-access-content">
                  <small>FOR HOSPITAL TEAMS</small>
                  <strong>Hospital access</strong>
                  <span>Staff, hospital admin, and registration services from one central platform.</span>
                  <b>Continue as Hospital <ArrowRight size={16} /></b>
                </span>
              </button>
              <button type="button" className="landing-access-card landing-access-card-patient" onClick={() => navigate('/patient/login')}>
                <span className="landing-access-icon"><UserRound size={27} /></span>
                <span className="landing-access-content">
                  <small>FOR PATIENTS</small>
                  <strong>Patient access</strong>
                  <span>Book appointments, get digital tokens, and track your real-time OPD queue.</span>
                  <b>Continue as Patient <ArrowRight size={16} /></b>
                </span>
              </button>
            </div>
          </div>
        </section>

        <section id="about" className="landing-about landing-section">
          <div className="landing-container landing-two-column">
            <div className="landing-about-visual">
              <div className="landing-about-frame">
                <div className="landing-about-topline"><span>HospitalFlow</span><span>Connected care</span></div>
                <div className="landing-about-screen">
                  <div className="landing-screen-sidebar"><span /><span /><span /><span /></div>
                  <div className="landing-screen-content">
                    <div className="landing-screen-title" />
                    <div className="landing-screen-row"><span /><span /><span /></div>
                    <div className="landing-screen-row"><span /><span /><span /></div>
                    <div className="landing-screen-row"><span /><span /><span /></div>
                  </div>
                </div>
              </div>
              <div className="landing-about-badge"><HeartPulse size={19} /><span><b>Human-centered</b><small>technology for better care</small></span></div>
            </div>
            <div className="landing-section-heading">
              <span className="landing-section-kicker">ABOUT HOSPITALFLOW</span>
              <h2>Make every part of the OPD journey feel more connected.</h2>
              <p>HospitalFlow brings the operational and patient sides of healthcare together. It helps hospitals coordinate daily work while giving patients a clearer, calmer way to access care.</p>
              <p>From appointment booking to live queue visibility, every interaction is designed to keep people informed and teams in control.</p>
              <a href="#features" className="landing-text-link">Explore our capabilities <ArrowRight size={16} /></a>
            </div>
          </div>
        </section>

        <section id="features" className="landing-features landing-section">
          <div className="landing-container">
            <div className="landing-section-heading landing-centered-heading">
              <span className="landing-section-kicker">BUILT FOR BETTER FLOW</span>
              <h2>Everything your healthcare journey needs.</h2>
              <p>Purposeful tools for the people, processes, and moments that keep a hospital moving.</p>
            </div>
            <div className="landing-feature-grid">
              {features.map(({ icon: Icon, title, description, tone }) => (
                <article className={`landing-feature-card landing-feature-${tone}`} key={title}>
                  <span className="landing-feature-icon"><Icon size={22} /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="landing-feature-line" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-highlights landing-section">
          <div className="landing-container">
            <div className="landing-highlights-heading">
              <span className="landing-section-kicker">THE HOSPITALFLOW DIFFERENCE</span>
              <h2>Clarity at every step of care.</h2>
            </div>
            <div className="landing-highlights-grid">
              {highlights.map(({ icon: Icon, label }) => (
                <div className="landing-highlight" key={label}><Icon size={22} /><span>{label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-benefits landing-section">
          <div className="landing-container landing-two-column landing-benefits-grid">
            <div className="landing-section-heading">
              <span className="landing-section-kicker">WHY HOSPITALFLOW</span>
              <h2>Designed around the people behind better healthcare.</h2>
              <p>Reliable structure, timely information, and a thoughtful experience for every role in the care journey.</p>
            </div>
            <div className="landing-benefit-list">
              {benefits.map((benefit) => <div key={benefit}><CheckCircle2 size={19} /><span>{benefit}</span></div>)}
            </div>
          </div>
        </section>

        <section id="contact" className="landing-cta">
          <div className="landing-container landing-cta-inner">
            <div><span className="landing-section-kicker">READY TO MOVE FORWARD?</span><h2>Make healthcare flow better.</h2><p>Bring appointments, tokens, and OPD operations into one connected experience.</p></div>
            <button type="button" className="landing-button landing-button-light" onClick={() => navigate('/hospital-portal')}>Get Started <ArrowRight size={17} /></button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-grid">
          <div className="landing-footer-brand"><a href="#home" className="landing-brand"><span className="landing-brand-mark"><img src="/assets/logo.png" alt="" /></span><span><strong>Hospital<span>Flow</span></strong><small>Smart OPD Platform</small></span></a><p>Connected healthcare operations for a better patient journey.</p></div>
          <div><h3>Explore</h3><a href="#about">About HospitalFlow</a><a href="#features">Capabilities</a><a href="#access">Access platform</a></div>
          <div><h3>Access</h3><button type="button" onClick={() => navigate('/hospital-portal')}>Hospital portal</button><button type="button" onClick={() => navigate('/patient/login')}>Patient portal</button></div>
          <div><h3>Our promise</h3><p className="landing-footer-promise"><ShieldCheck size={18} /> Secure, clear, human-centered care experiences.</p></div>
        </div>
        <div className="landing-container landing-footer-bottom"><span>© {new Date().getFullYear()} HospitalFlow. Smart OPD Platform.</span><span>Built for better flow.</span></div>
      </footer>
    </div>
  );
}
