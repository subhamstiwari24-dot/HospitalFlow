import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  Stethoscope,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import "./style.css";

type DoctorStatus = "Available" | "Delayed" | "Break";

const doctors = [
  {
    name: "Dr. Priya Sharma",
    department: "General Medicine",
    status: "Available" as DoctorStatus,
    patients: 18,
    token: "A24",
  },
  {
    name: "Dr. Rahul Mehta",
    department: "Cardiology",
    status: "Delayed" as DoctorStatus,
    patients: 11,
    token: "C18",
  },
  {
    name: "Dr. Neha Patel",
    department: "Dermatology",
    status: "Available" as DoctorStatus,
    patients: 9,
    token: "D12",
  },
  {
    name: "Dr. Arjun Rao",
    department: "Orthopedics",
    status: "Break" as DoctorStatus,
    patients: 6,
    token: "O08",
  },
];

const appointments = [
  {
    patient: "Aarav Mehta",
    doctor: "Dr. Priya Sharma",
    department: "General Medicine",
    token: "A25",
    time: "10:30 AM",
    status: "Waiting",
  },
  {
    patient: "Sneha Kulkarni",
    doctor: "Dr. Rahul Mehta",
    department: "Cardiology",
    token: "C19",
    time: "10:45 AM",
    status: "Confirmed",
  },
  {
    patient: "Rohan Shah",
    doctor: "Dr. Neha Patel",
    department: "Dermatology",
    token: "D13",
    time: "11:00 AM",
    status: "Waiting",
  },
  {
    patient: "Ananya Singh",
    doctor: "Dr. Arjun Rao",
    department: "Orthopedics",
    token: "O09",
    time: "11:15 AM",
    status: "Confirmed",
  },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>

          <div>
            <h2>HospitalFlow</h2>
            <span>Admin Console</span>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="hospital-selector">
          <div className="hospital-avatar">MH</div>
          <div>
            <strong>Metro Health Hospital</strong>
            <span>Main Branch</span>
          </div>
          <ChevronRight size={16} />
        </div>

        <nav className="nav">
          <p className="nav-label">MAIN MENU</p>

          <a className="nav-item active">
            <LayoutDashboard size={19} />
            Overview
          </a>

          <a className="nav-item">
            <Activity size={19} />
            OPD Queue
            <span className="nav-badge">12</span>
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
            Patients
          </a>

          <a className="nav-item">
            <UserRound size={19} />
            Departments
          </a>

          <p className="nav-label second">MANAGEMENT</p>

          <a className="nav-item">
            <Activity size={19} />
            Analytics
          </a>

          <a className="nav-item">
            <Settings size={19} />
            Settings
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">AS</div>
            <div>
              <strong>Admin Staff</strong>
              <span>Hospital Administrator</span>
            </div>
          </div>

          <button className="logout-btn">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="page-heading">
            <div>
              <h1>Overview</h1>
              <p>Monitor your hospital's OPD operations</p>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={18} />
              <input placeholder="Search patients, doctors..." />
            </div>

            <button className="icon-btn notification">
              <Bell size={20} />
              <span />
            </button>

            <div className="admin-mini-profile">
              <div className="profile-avatar small">AS</div>
              <div>
                <strong>Admin Staff</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <h2>Good morning, Admin 👋</h2>
              <p>Here's what's happening in your hospital today.</p>
            </div>

            <div className="date-pill">
              <CalendarDays size={17} />
              Monday, 23 September 2026
            </div>
          </div>

          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total Appointments</span>
                <div className="stat-icon blue">
                  <CalendarDays size={20} />
                </div>
              </div>

              <div className="stat-number">148</div>

              <div className="stat-footer positive">
                <span>↑ 12.5%</span>
                <small>vs yesterday</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Patients Waiting</span>
                <div className="stat-icon orange">
                  <Clock3 size={20} />
                </div>
              </div>

              <div className="stat-number">37</div>

              <div className="stat-footer warning">
                <span>8 high priority</span>
                <small>currently waiting</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Active Doctors</span>
                <div className="stat-icon green">
                  <Stethoscope size={20} />
                </div>
              </div>

              <div className="stat-number">14</div>

              <div className="stat-footer positive">
                <span>12 available</span>
                <small>2 on break</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Completed Today</span>
                <div className="stat-icon purple">
                  <Activity size={20} />
                </div>
              </div>

              <div className="stat-number">86</div>

              <div className="stat-footer positive">
                <span>↑ 8.2%</span>
                <small>vs yesterday</small>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel queue-panel">
              <div className="panel-header">
                <div>
                  <h3>Live OPD Status</h3>
                  <p>Real-time department activity</p>
                </div>

                <span className="live-pill">
                  <i />
                  LIVE
                </span>
              </div>

              <div className="queue-highlight">
                <div>
                  <span className="queue-label">CURRENT TOKEN</span>
                  <strong>A24</strong>
                  <p>General Medicine</p>
                </div>

                <div className="queue-wait">
                  <Clock3 size={18} />
                  <div>
                    <strong>40–55 min</strong>
                    <span>Estimated wait</span>
                  </div>
                </div>
              </div>

              <div className="queue-list">
                <div className="queue-title">
                  <span>Current Queue</span>
                  <span>Position</span>
                </div>

                {["A21", "A22", "A23", "A24", "A25"].map(
                  (token, index) => (
                    <div
                      className={`queue-row ${
                        token === "A24" ? "current" : ""
                      }`}
                      key={token}
                    >
                      <div className="token-number">{token}</div>

                      <div className="queue-person">
                        <strong>
                          {token === "A24"
                            ? "Current Patient"
                            : `Patient ${index + 1}`}
                        </strong>
                        <span>
                          {token === "A24"
                            ? "Being called"
                            : "Waiting"}
                        </span>
                      </div>

                      <div className="queue-position">
                        {index + 1}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="panel alert-panel">
              <div className="panel-header">
                <div>
                  <h3>Attention Required</h3>
                  <p>Items that need your attention</p>
                </div>

                <AlertTriangle size={21} />
              </div>

              <div className="alert-card emergency">
                <div className="alert-icon">
                  <AlertTriangle size={19} />
                </div>
                <div>
                  <strong>Priority patient detected</strong>
                  <p>
                    Emergency case added to Cardiology queue.
                  </p>
                  <button>View queue →</button>
                </div>
              </div>

              <div className="alert-card delay">
                <div className="alert-icon">
                  <Clock3 size={19} />
                </div>
                <div>
                  <strong>Doctor delay</strong>
                  <p>
                    Dr. Rahul Mehta is running 15 minutes late.
                  </p>
                  <button>Update status →</button>
                </div>
              </div>

              <div className="alert-card info">
                <div className="alert-icon">
                  <Users size={19} />
                </div>
                <div>
                  <strong>High patient load</strong>
                  <p>
                    General Medicine has 18 patients waiting.
                  </p>
                  <button>View department →</button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel doctors-panel">
            <div className="panel-header">
              <div>
                <h3>Doctor Status</h3>
                <p>Current OPD availability</p>
              </div>

              <button className="view-all">View all doctors →</button>
            </div>

            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <div className="doctor-card" key={doctor.name}>
                  <div className="doctor-card-top">
                    <div className="doctor-avatar">
                      {doctor.name
                        .replace("Dr. ", "")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>

                    <button className="more-btn">
                      <MoreHorizontal size={19} />
                    </button>
                  </div>

                  <h4>{doctor.name}</h4>
                  <span className="doctor-department">
                    {doctor.department}
                  </span>

                  <div className="doctor-info">
                    <span className={`status ${doctor.status.toLowerCase()}`}>
                      <i />
                      {doctor.status}
                    </span>

                    <span>{doctor.patients} patients</span>
                  </div>

                  <div className="doctor-token">
                    <span>Current Token</span>
                    <strong>{doctor.token}</strong>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel appointments-panel">
            <div className="panel-header">
              <div>
                <h3>Today's Appointments</h3>
                <p>Latest scheduled OPD appointments</p>
              </div>

              <button className="view-all">
                View all appointments →
              </button>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Token</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment.token}>
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar">
                            {appointment.patient
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <strong>{appointment.patient}</strong>
                        </div>
                      </td>

                      <td>{appointment.doctor}</td>
                      <td>{appointment.department}</td>
                      <td>
                        <span className="table-token">
                          {appointment.token}
                        </span>
                      </td>
                      <td>{appointment.time}</td>
                      <td>
                        <span
                          className={`appointment-status ${appointment.status.toLowerCase()}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;