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
import { useCallback, useEffect, useState } from "react";
import "./style.css";

type DoctorStatus = "Available" | "Delayed" | "Break";

type Appointment = {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  tokenNumber: string;
  status: string;
  priority?: string;
  doctor?: {
    id: number;
    name: string;
    specialization: string;
  };
  hospital?: {
    id: number;
    name: string;
    city: string;
  };
};

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

const API_URL = "http://localhost:8080/api";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const loadAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);

      const response = await fetch(`${API_URL}/appointments`);

      if (!response.ok) {
        throw new Error("Failed to load appointments");
      }

      const data = await response.json();

      setAppointments(data);
      setConnectionStatus("Backend Connected");
    } catch (error) {
      console.error("Appointment loading error:", error);
      setConnectionStatus("Backend Offline");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const updateAppointmentStatus = async (
    id: number,
    status: string
  ) => {
    try {
      setUpdatingId(id);

      const response = await fetch(
        `${API_URL}/appointments/${id}/status?status=${encodeURIComponent(
          status
        )}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update appointment status");
      }

      const updatedAppointment = await response.json();

      setAppointments((currentAppointments) =>
        currentAppointments.map((appointment) =>
          appointment.id === id
            ? updatedAppointment
            : appointment
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      alert("Unable to update appointment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const waitingCount = appointments.filter(
    (appointment) =>
      appointment.status?.toUpperCase() === "WAITING"
  ).length;

  const inProgressCount = appointments.filter(
    (appointment) =>
      appointment.status?.toUpperCase() === "IN_PROGRESS"
  ).length;

  const completedCount = appointments.filter(
    (appointment) =>
      appointment.status?.toUpperCase() === "COMPLETED"
  ).length;

  return (
    <div className="admin-app">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
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
            <span className="nav-badge">
              {waitingCount}
            </span>
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
              <p>
                Monitor your hospital's OPD operations
              </p>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={18} />
              <input
                placeholder="Search patients, doctors..."
              />
            </div>

            <button className="icon-btn notification">
              <Bell size={20} />
              <span />
            </button>

            <div className="admin-mini-profile">
              <div className="profile-avatar small">
                AS
              </div>

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

              <p>
                Here's what's happening in your hospital today.
              </p>

              <p
                style={{
                  marginTop: "8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color:
                    connectionStatus === "Backend Connected"
                      ? "#16a34a"
                      : "#dc2626",
                }}
              >
                ● {connectionStatus}
              </p>
            </div>

            <div className="date-pill">
              <CalendarDays size={17} />
              24 September 2026
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

              <div className="stat-number">
                {appointments.length}
              </div>

              <div className="stat-footer positive">
                <span>Live</span>
                <small>from database</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-top">
                <span>Patients Waiting</span>

                <div className="stat-icon orange">
                  <Clock3 size={20} />
                </div>
              </div>

              <div className="stat-number">
                {waitingCount}
              </div>

              <div className="stat-footer warning">
                <span>{inProgressCount} in progress</span>
                <small>currently</small>
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

              <div className="stat-number">
                {completedCount}
              </div>

              <div className="stat-footer positive">
                <span>Live</span>
                <small>from database</small>
              </div>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="panel queue-panel">
              <div className="panel-header">
                <div>
                  <h3>Live OPD Status</h3>

                  <p>
                    Real-time department activity
                  </p>
                </div>

                <span className="live-pill">
                  <i />
                  LIVE
                </span>
              </div>

              <div className="queue-highlight">
                <div>
                  <span className="queue-label">
                    CURRENT TOKEN
                  </span>

                  <strong>
                    {appointments.find(
                      (a) =>
                        a.status === "IN_PROGRESS"
                    )?.tokenNumber || "—"}
                  </strong>

                  <p>General Medicine</p>
                </div>

                <div className="queue-wait">
                  <Clock3 size={18} />

                  <div>
                    <strong>Live Queue</strong>
                    <span>
                      {waitingCount} waiting
                    </span>
                  </div>
                </div>
              </div>

              <div className="queue-list">
                <div className="queue-title">
                  <span>Current Queue</span>
                  <span>Position</span>
                </div>

                {appointments
                  .filter(
                    (appointment) =>
                      appointment.status === "WAITING"
                  )
                  .map((appointment, index) => (
                    <div
                      className="queue-row"
                      key={appointment.id}
                    >
                      <div className="token-number">
                        {appointment.tokenNumber}
                      </div>

                      <div className="queue-person">
                        <strong>
                          {appointment.patientName}
                        </strong>

                        <span>
                          {appointment.priority ||
                            "NORMAL"}
                        </span>
                      </div>

                      <div className="queue-position">
                        {index + 1}
                      </div>
                    </div>
                  ))}

                {waitingCount === 0 && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      opacity: 0.6,
                    }}
                  >
                    No patients currently waiting.
                  </div>
                )}
              </div>
            </div>

            <div className="panel alert-panel">
              <div className="panel-header">
                <div>
                  <h3>Attention Required</h3>

                  <p>
                    Items that need your attention
                  </p>
                </div>

                <AlertTriangle size={21} />
              </div>

              <div className="alert-card emergency">
                <div className="alert-icon">
                  <AlertTriangle size={19} />
                </div>

                <div>
                  <strong>
                    Priority patient detection
                  </strong>

                  <p>
                    Emergency and priority cases are
                    placed ahead in the queue.
                  </p>

                  <button>
                    View queue →
                  </button>
                </div>
              </div>

              <div className="alert-card delay">
                <div className="alert-icon">
                  <Clock3 size={19} />
                </div>

                <div>
                  <strong>Doctor delay</strong>

                  <p>
                    Doctor status can be updated from
                    the management module.
                  </p>

                  <button>
                    Update status →
                  </button>
                </div>
              </div>

              <div className="alert-card info">
                <div className="alert-icon">
                  <Users size={19} />
                </div>

                <div>
                  <strong>Live patient load</strong>

                  <p>
                    Current waiting patients:
                    {waitingCount}
                  </p>

                  <button>
                    View department →
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="panel doctors-panel">
            <div className="panel-header">
              <div>
                <h3>Doctor Status</h3>

                <p>
                  Current OPD availability
                </p>
              </div>

              <button className="view-all">
                View all doctors →
              </button>
            </div>

            <div className="doctor-grid">
              {doctors.map((doctor) => (
                <div
                  className="doctor-card"
                  key={doctor.name}
                >
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
                    <span
                      className={`status ${doctor.status.toLowerCase()}`}
                    >
                      <i />
                      {doctor.status}
                    </span>

                    <span>
                      {doctor.patients} patients
                    </span>
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
                <h3>Appointments</h3>

                <p>
                  Live appointments from HospitalFlow
                  backend
                </p>
              </div>

              <button
                className="view-all"
                onClick={loadAppointments}
              >
                Refresh →
              </button>
            </div>

            <div className="table-wrapper">
              {loadingAppointments ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  Loading appointments...
                </div>
              ) : appointments.length === 0 ? (
                <div
                  style={{
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  No appointments found.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Token</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appointment) => {
                      const status =
                        appointment.status?.toUpperCase();

                      return (
                        <tr key={appointment.id}>
                          <td>
                            <div className="patient-cell">
                              <div className="patient-avatar">
                                {appointment.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>

                              <strong>
                                {appointment.patientName}
                              </strong>
                            </div>
                          </td>

                          <td>
                            {appointment.doctor?.name ||
                              "—"}
                          </td>

                          <td>
                            {appointment.doctor
                              ?.specialization || "—"}
                          </td>

                          <td>
                            <span className="table-token">
                              {appointment.tokenNumber}
                            </span>
                          </td>

                          <td>
                            {appointment.appointmentTime ||
                              "—"}
                          </td>

                          <td>
                            <span
                              className={`appointment-status ${status
                                .toLowerCase()
                                .replace("_", "-")}`}
                            >
                              {status.replace("_", " ")}
                            </span>
                          </td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: "6px",
                                flexWrap: "wrap",
                              }}
                            >
                              {status === "WAITING" && (
                                <button
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "IN_PROGRESS"
                                    )
                                  }
                                  disabled={
                                    updatingId ===
                                    appointment.id
                                  }
                                  style={{
                                    padding: "7px 10px",
                                    border: "none",
                                    borderRadius: "7px",
                                    cursor:
                                      "pointer",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {updatingId ===
                                  appointment.id
                                    ? "Updating..."
                                    : "Start"}
                                </button>
                              )}

                              {status ===
                                "IN_PROGRESS" && (
                                <button
                                  onClick={() =>
                                    updateAppointmentStatus(
                                      appointment.id,
                                      "COMPLETED"
                                    )
                                  }
                                  disabled={
                                    updatingId ===
                                    appointment.id
                                  }
                                  style={{
                                    padding: "7px 10px",
                                    border: "none",
                                    borderRadius: "7px",
                                    cursor:
                                      "pointer",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  {updatingId ===
                                  appointment.id
                                    ? "Updating..."
                                    : "Complete"}
                                </button>
                              )}

                              {status === "COMPLETED" && (
                                <span
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    opacity: 0.6,
                                  }}
                                >
                                  Done
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;