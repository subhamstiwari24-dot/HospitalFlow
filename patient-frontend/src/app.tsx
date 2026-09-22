import {
  Activity,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  HeartPulse,
  MapPin,
  Search,
  Stethoscope,
  Users,
} from "lucide-react";
import { renderToString } from "react-dom/server";
import "./style.css";

export function render() {
  return {
    head: "",
    html: renderToString(<App />),
  };
}

function App() {
  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>
          <div>
            <h2>HospitalFlow</h2>
            <span>Smart OPD Care</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a className="nav-item active">
            <Activity size={19} />
            Dashboard
          </a>

          <a className="nav-item">
            <CalendarDays size={19} />
            Appointments
          </a>

          <a className="nav-item">
            <Stethoscope size={19} />
            Doctors
          </a>

          <a className="nav-item">
            <Users size={19} />
            My Visits
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">?</div>
            <div>
              <strong>Need help?</strong>
              <p>Contact HospitalFlow support</p>
            </div>
          </div>

          <div className="profile">
            <div className="avatar">ST</div>
            <div>
              <strong>Subham Tiwari</strong>
              <span>Patient</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Header */}
        <header className="topbar">
          <div>
            <p className="eyebrow">PATIENT DASHBOARD</p>
            <h1>Good evening, Subham 👋</h1>
            <p className="subtitle">
              Manage your appointments and track your OPD visits in real time.
            </p>
          </div>

          <button className="notification-btn">
            <Bell size={20} />
            <span></span>
          </button>
        </header>

        {/* Search */}
        <section className="search-section">
          <div className="search-box">
            <Search size={21} />
            <input
              type="text"
              placeholder="Search hospitals, doctors or departments..."
            />
          </div>

          <button className="location-btn">
            <MapPin size={18} />
            Mumbai
          </button>
        </section>

        {/* Current Appointment */}
        <section className="hero-card">
          <div className="hero-left">
            <div className="live-label">
              <span className="live-dot"></span>
              LIVE OPD
            </div>

            <h2>Your appointment is in progress</h2>

            <p>
              Dr. Priya Sharma · General Medicine
            </p>

            <div className="hospital-name">
              <MapPin size={16} />
              CityCare Hospital, Mumbai
            </div>

            <button className="track-btn">
              Track Live Queue
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="token-box">
            <span>Your Token</span>
            <strong>A24</strong>
            <small>2 patients ahead</small>
          </div>
        </section>

        {/* Stats */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Users size={21} />
            </div>
            <div>
              <span>Patients Ahead</span>
              <strong>2</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Estimated Wait</span>
              <strong>40–55 min</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <CalendarDays size={21} />
            </div>
            <div>
              <span>Appointment</span>
              <strong>Today, 7:30 PM</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Activity size={21} />
            </div>
            <div>
              <span>Doctor Status</span>
              <strong className="available">Available</strong>
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="content-grid">
          {/* Queue */}
          <div className="panel queue-panel">
            <div className="panel-header">
              <div>
                <span className="section-label">LIVE QUEUE</span>
                <h3>Current OPD Queue</h3>
              </div>

              <span className="live-badge">
                <span className="live-dot"></span>
                Live
              </span>
            </div>

            <div className="queue-list">
              <div className="queue-row completed">
                <span className="queue-token">A22</span>
                <span>Completed</span>
                <span>✓</span>
              </div>

              <div className="queue-row completed">
                <span className="queue-token">A23</span>
                <span>Completed</span>
                <span>✓</span>
              </div>

              <div className="queue-row current">
                <span className="queue-token">A24</span>
                <span>Your Token</span>
                <strong>Next</strong>
              </div>

              <div className="queue-row">
                <span className="queue-token">A25</span>
                <span>Waiting</span>
                <span>2 min</span>
              </div>

              <div className="queue-row">
                <span className="queue-token">A26</span>
                <span>Waiting</span>
                <span>7 min</span>
              </div>
            </div>
          </div>

          {/* AI Estimate */}
          <div className="panel estimate-panel">
            <div className="ai-header">
              <div className="ai-icon">
                <Activity size={20} />
              </div>

              <div>
                <span className="section-label">AI ESTIMATE</span>
                <h3>Waiting Time Prediction</h3>
              </div>
            </div>

            <div className="estimate-time">40–55 min</div>

            <p>
              Estimated using current queue, doctor availability and average
              consultation time.
            </p>

            <div className="confidence">
              <div className="confidence-top">
                <span>Prediction confidence</span>
                <strong>87%</strong>
              </div>

              <div className="progress">
                <div className="progress-fill"></div>
              </div>
            </div>

            <div className="updated">
              <span className="live-dot"></span>
              Updated just now
            </div>
          </div>
        </section>

        {/* Hospitals */}
        <section className="hospitals-section">
          <div className="section-heading">
            <div>
              <span className="section-label">DISCOVER CARE</span>
              <h2>Available Hospitals</h2>
            </div>

            <button className="view-all">View all</button>
          </div>

          <div className="hospital-grid">
            <div className="hospital-card">
              <div className="hospital-image image-one">
                <span className="integrated">Live Connected</span>
              </div>

              <div className="hospital-info">
                <h3>CityCare Hospital</h3>
                <p>Andheri West · 1.8 km</p>

                <div className="hospital-meta">
                  <span>● 12 doctors available</span>
                  <span>Live OPD</span>
                </div>
              </div>
            </div>

            <div className="hospital-card">
              <div className="hospital-image image-two">
                <span className="integrated">Live Connected</span>
              </div>

              <div className="hospital-info">
                <h3>Wellness Multispeciality</h3>
                <p>Bandra · 3.2 km</p>

                <div className="hospital-meta">
                  <span>● 8 doctors available</span>
                  <span>Live OPD</span>
                </div>
              </div>
            </div>

            <div className="hospital-card">
              <div className="hospital-image image-three">
                <span className="listed">Listed Hospital</span>
              </div>

              <div className="hospital-info">
                <h3>Metro Health Centre</h3>
                <p>Santacruz · 4.1 km</p>

                <div className="hospital-meta">
                  <span>Information only</span>
                  <span>Not connected</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;