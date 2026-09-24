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

import { Client } from "@stomp/stompjs";
import { useEffect, useState } from "react";
import { renderToString } from "react-dom/server";

import "./style.css";

/*
 * IMPORTANT:
 * Patient frontend uses a custom SSR renderer.
 * Therefore this render() function must remain here.
 */
export function render() {
  return {
    head: "",
    html: renderToString(<App />),
  };
}

/* ================= TYPES ================= */

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
    qualification?: string;
    experience?: string;
    status?: string;
    consultationTime?: string;
  };

  hospital?: {
    id: number;
    name: string;
    address?: string;
    city: string;
    phone?: string;
  };
};

type WaitingTime = {
  tokenNumber: string;
  patientsAhead: number;
  estimatedMinMinutes: number;
  estimatedMaxMinutes: number;
  message: string;
};

/* ================= APP ================= */

function App() {
  /*
   * Backend
   */
  const API_URL = "http://127.0.0.1:8080/api";

  /*
   * Demo patient appointment.
   *
   * Appointment ID 1 = Rahul Patil / A01
   */
  const PATIENT_APPOINTMENT_ID = 5;

  /* ================= STATE ================= */

  const [appointment, setAppointment] =
    useState<Appointment | null>(null);

  const [waitingTime, setWaitingTime] =
    useState<WaitingTime | null>(null);

  const [queue, setQueue] =
    useState<Appointment[]>([]);

  const [queueStatus, setQueueStatus] =
    useState("Connecting to live queue...");

  const [loading, setLoading] =
    useState(true);

  /* ================= LOAD QUEUE ================= */

  const loadQueue = async (
    appointmentData?: Appointment
  ) => {
    try {
      const currentAppointment =
        appointmentData || appointment;

      if (
        !currentAppointment ||
        !currentAppointment.doctor?.id ||
        !currentAppointment.appointmentDate
      ) {
        return;
      }

      const doctorId =
        currentAppointment.doctor.id;

      const appointmentDate =
        currentAppointment.appointmentDate;

      const queueResponse =
        await fetch(
          `${API_URL}/appointments/queue?doctorId=${doctorId}&appointmentDate=${appointmentDate}`
        );

      if (!queueResponse.ok) {
        throw new Error(
          "Unable to load live queue"
        );
      }

      const queueData =
        await queueResponse.json();

      setQueue(queueData);

      console.log(
        "Live queue loaded:",
        queueData
      );
    } catch (error) {
      console.error(
        "Queue loading error:",
        error
      );
    }
  };

  /* ================= LOAD PATIENT DATA ================= */

  const loadPatientData = async () => {
    try {
      setLoading(true);

      /*
       * Get appointment
       */
      const appointmentResponse =
        await fetch(
          `${API_URL}/appointments/${PATIENT_APPOINTMENT_ID}`
        );

      if (!appointmentResponse.ok) {
        throw new Error(
          "Unable to load appointment"
        );
      }

      const appointmentData =
        await appointmentResponse.json();

      setAppointment(appointmentData);

      /*
       * Get waiting time
       */
      const waitingResponse =
        await fetch(
          `${API_URL}/appointments/${PATIENT_APPOINTMENT_ID}/waiting-time`
        );

      if (waitingResponse.ok) {
        const waitingData =
          await waitingResponse.json();

        setWaitingTime(waitingData);
      }

      /*
       * Get dynamic queue
       */
      await loadQueue(appointmentData);

      setLoading(false);
    } catch (error) {
      console.error(
        "Patient data loading error:",
        error
      );

      setLoading(false);

      setQueueStatus(
        "Backend connection error"
      );
    }
  };

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    loadPatientData();
  }, []);

  /* ================= WEBSOCKET ================= */

  useEffect(() => {
    let mounted = true;

    const client =
      new Client({
        brokerURL:
          "ws://127.0.0.1:8080/ws",

        reconnectDelay: 5000,

        onConnect: () => {
          console.log(
            "HospitalFlow WebSocket connected"
          );

          if (mounted) {
            setQueueStatus(
              "Live queue connected"
            );
          }

          /*
           * Subscribe to live queue updates
           */
          client.subscribe(
            "/topic/queue",
            async (message) => {
              try {
                const data =
                  JSON.parse(
                    message.body
                  );

                console.log(
                  "Live queue update:",
                  data
                );

                /*
                 * Refresh current appointment
                 */
                const appointmentResponse =
                  await fetch(
                    `${API_URL}/appointments/${PATIENT_APPOINTMENT_ID}`
                  );

                let updatedAppointment:
                  | Appointment
                  | null = null;

                if (
                  appointmentResponse.ok
                ) {
                  updatedAppointment =
                    await appointmentResponse.json();

                  if (mounted) {
                    setAppointment(
                      updatedAppointment
                    );
                  }
                }

                /*
                 * Refresh waiting time
                 */
                const waitingResponse =
                  await fetch(
                    `${API_URL}/appointments/${PATIENT_APPOINTMENT_ID}/waiting-time`
                  );

                if (
                  waitingResponse.ok
                ) {
                  const waitingData =
                    await waitingResponse.json();

                  if (mounted) {
                    setWaitingTime(
                      waitingData
                    );
                  }
                }

                /*
                 * Refresh complete dynamic queue
                 */
                if (updatedAppointment) {
                  await loadQueue(
                    updatedAppointment
                  );
                }

              } catch (error) {
                console.error(
                  "Unable to process WebSocket message:",
                  error
                );
              }
            }
          );
        },

        onDisconnect: () => {
          console.log(
            "HospitalFlow WebSocket disconnected"
          );

          if (mounted) {
            setQueueStatus(
              "Reconnecting..."
            );
          }
        },

        onStompError: (frame) => {
          console.error(
            "WebSocket STOMP error:",
            frame.headers["message"]
          );

          if (mounted) {
            setQueueStatus(
              "Live connection error"
            );
          }
        },

        onWebSocketError: (error) => {
          console.error(
            "WebSocket error:",
            error
          );

          if (mounted) {
            setQueueStatus(
              "WebSocket connection error"
            );
          }
        },
      });

    client.activate();

    return () => {
      mounted = false;
      client.deactivate();
    };
  }, []);

  /* ================= DISPLAY VALUES ================= */

  const currentToken =
    appointment?.tokenNumber ||
    "Loading...";

  const currentStatus =
    appointment?.status?.toUpperCase() ||
    "WAITING";

  const patientsAhead =
    waitingTime?.patientsAhead ?? 0;

  const estimatedWait =
    waitingTime
      ? `${waitingTime.estimatedMinMinutes}–${waitingTime.estimatedMaxMinutes} min`
      : "Calculating...";

  const doctorName =
    appointment?.doctor?.name ||
    "Dr. Priya Sharma";

  const department =
    appointment?.doctor?.specialization ||
    "General Medicine";

  const hospitalName =
    appointment?.hospital?.name ||
    "Metro Health Hospital";

  const hospitalCity =
    appointment?.hospital?.city ||
    "Mumbai";

  /* ================= STATUS TEXT ================= */

  const appointmentStatusText =
    currentStatus === "IN_PROGRESS"
      ? "Your appointment is in progress"
      : currentStatus === "COMPLETED"
      ? "Your appointment is completed"
      : currentStatus === "CANCELLED"
      ? "Your appointment was cancelled"
      : "Your appointment is waiting";

  const tokenStatusText =
    currentStatus === "IN_PROGRESS"
      ? "Currently being served"
      : currentStatus === "COMPLETED"
      ? "Consultation completed"
      : currentStatus === "CANCELLED"
      ? "Cancelled"
      : "Waiting in queue";

  /* ================= QUEUE DISPLAY ================= */

  const getQueueStatusText = (
    queueAppointment: Appointment
  ) => {
    if (
      queueAppointment.priority ===
      "EMERGENCY"
    ) {
      return "Emergency";
    }

    if (
      queueAppointment.priority ===
      "PRIORITY"
    ) {
      return "Priority";
    }

    return "Waiting";
  };

  const getQueueWaitTime = (
    index: number
  ) => {
    /*
     * Current prototype estimate:
     * 10 minutes average consultation.
     *
     * Final AI service will replace this
     * with real prediction.
     */
    const min = index * 10;

    if (min === 0) {
      return "Next";
    }

    return `${min} min`;
  };

  /* ================= UI ================= */

  return (
    <div className="app">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <HeartPulse size={22} />
          </div>

          <div>
            <h2>
              HospitalFlow
            </h2>

            <span>
              Smart OPD Care
            </span>
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

            <div className="help-icon">
              ?
            </div>

            <div>
              <strong>
                Need help?
              </strong>

              <p>
                Contact HospitalFlow support
              </p>
            </div>

          </div>

          <div className="profile">

            <div className="avatar">
              ST
            </div>

            <div>
              <strong>
                Subham Tiwari
              </strong>

              <span>
                Patient
              </span>
            </div>

          </div>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="main-content">

        {/* ================= HEADER ================= */}

        <header className="topbar">

          <div>

            <p className="eyebrow">
              PATIENT DASHBOARD
            </p>

            <h1>
              Good evening, Subham 👋
            </h1>

            <p className="subtitle">
              Manage your appointments and
              track your OPD visits in real time.
            </p>

          </div>

          <button className="notification-btn">
            <Bell size={20} />
            <span></span>
          </button>

        </header>

        {/* ================= SEARCH ================= */}

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

        {/* ================= CURRENT APPOINTMENT ================= */}

        <section className="hero-card">

          <div className="hero-left">

            <div className="live-label">
              <span className="live-dot"></span>
              LIVE OPD
            </div>

            <h2>
              {loading
                ? "Loading appointment..."
                : appointmentStatusText}
            </h2>

            <p>
              {doctorName} · {department}
            </p>

            <div className="hospital-name">
              <MapPin size={16} />
              {hospitalName}, {hospitalCity}
            </div>

            <button className="track-btn">
              Track Live Queue
              <ChevronRight size={18} />
            </button>

          </div>

          {/* TOKEN */}

          <div className="token-box">

            <span>
              Your Token
            </span>

            <strong>
              {currentToken}
            </strong>

            <small>
              {tokenStatusText}
            </small>

          </div>

        </section>

        {/* ================= STATS ================= */}

        <section className="stats-grid">

          {/* PATIENTS AHEAD */}

          <div className="stat-card">

            <div className="stat-icon blue">
              <Users size={21} />
            </div>

            <div>
              <span>
                Patients Ahead
              </span>

              <strong>
                {patientsAhead}
              </strong>
            </div>

          </div>

          {/* ESTIMATED WAIT */}

          <div className="stat-card">

            <div className="stat-icon green">
              <Clock3 size={21} />
            </div>

            <div>
              <span>
                Estimated Wait
              </span>

              <strong>
                {estimatedWait}
              </strong>
            </div>

          </div>

          {/* APPOINTMENT */}

          <div className="stat-card">

            <div className="stat-icon purple">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>
                Appointment
              </span>

              <strong>
                {appointment?.appointmentTime ||
                  "Today"}
              </strong>
            </div>

          </div>

          {/* DOCTOR STATUS */}

          <div className="stat-card">

            <div className="stat-icon orange">
              <Activity size={21} />
            </div>

            <div>
              <span>
                Doctor Status
              </span>

              <strong className="available">
                {appointment?.doctor?.status ||
                  "Available"}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= CONTENT GRID ================= */}

        <section className="content-grid">

          {/* ================= LIVE QUEUE ================= */}

          <div className="panel queue-panel">

            <div className="panel-header">

              <div>

                <span className="section-label">
                  LIVE QUEUE
                </span>

                <h3>
                  Current OPD Queue
                </h3>

              </div>

              <span className="live-badge">
                <span className="live-dot"></span>
                Live
              </span>

            </div>

            <div className="queue-list">

              {/* CURRENT PATIENT */}

              {currentStatus !==
                "WAITING" && (
                <div className="queue-row current">

                  <span className="queue-token">
                    {currentToken}
                  </span>

                  <span>
                    {currentStatus ===
                    "IN_PROGRESS"
                      ? "In Progress"
                      : currentStatus ===
                        "COMPLETED"
                      ? "Completed"
                      : currentStatus ===
                        "CANCELLED"
                      ? "Cancelled"
                      : "Your Token"}
                  </span>

                  <strong>
                    {currentStatus ===
                    "IN_PROGRESS"
                      ? "Now"
                      : currentStatus ===
                        "COMPLETED"
                      ? "Done"
                      : currentStatus ===
                        "CANCELLED"
                      ? "—"
                      : "Next"}
                  </strong>

                </div>
              )}

              {/* DYNAMIC WAITING QUEUE */}

              {queue.length === 0 ? (

                <div className="queue-row">

                  <span className="queue-token">
                    —
                  </span>

                  <span>
                    No patients waiting
                  </span>

                  <span>
                    —
                  </span>

                </div>

              ) : (

                queue.map(
                  (
                    queueAppointment,
                    index
                  ) => {

                    const isCurrentPatient =
                      Number(
                        queueAppointment.id
                      ) ===
                      PATIENT_APPOINTMENT_ID;

                    return (
                      <div
                        className={
                          isCurrentPatient
                            ? "queue-row current"
                            : "queue-row"
                        }
                        key={
                          queueAppointment.id
                        }
                      >

                        <span className="queue-token">
                          {
                            queueAppointment.tokenNumber
                          }
                        </span>

                        <span>
                          {isCurrentPatient
                            ? "Your Token"
                            : getQueueStatusText(
                                queueAppointment
                              )}
                        </span>

                        <strong>
                          {isCurrentPatient
                            ? "You"
                            : getQueueWaitTime(
                                index
                              )}
                        </strong>

                      </div>
                    );
                  }
                )

              )}

            </div>

            {/* LIVE CONNECTION */}

            <div className="updated">

              <span className="live-dot"></span>

              {queueStatus}

            </div>

          </div>

          {/* ================= AI ESTIMATE ================= */}

          <div className="panel estimate-panel">

            <div className="ai-header">

              <div className="ai-icon">
                <Activity size={20} />
              </div>

              <div>

                <span className="section-label">
                  AI ESTIMATE
                </span>

                <h3>
                  Waiting Time Prediction
                </h3>

              </div>

            </div>

            <div className="estimate-time">
              {estimatedWait}
            </div>

            <p>
              Estimated using current queue,
              doctor availability and average
              consultation time.
            </p>

            <div className="confidence">

              <div className="confidence-top">

                <span>
                  Prediction confidence
                </span>

                <strong>
                  87%
                </strong>

              </div>

              <div className="progress">
                <div className="progress-fill"></div>
              </div>

            </div>

            <div className="updated">

              <span className="live-dot"></span>

              {waitingTime
                ? "Updated from live queue"
                : "Calculating..."}

            </div>

          </div>

        </section>

        {/* ================= HOSPITALS ================= */}

        <section className="hospitals-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                DISCOVER CARE
              </span>

              <h2>
                Available Hospitals
              </h2>

            </div>

            <button className="view-all">
              View all
            </button>

          </div>

          <div className="hospital-grid">

            {/* CITYCARE */}

            <div className="hospital-card">

              <div className="hospital-image image-one">

                <span className="integrated">
                  Live Connected
                </span>

              </div>

              <div className="hospital-info">

                <h3>
                  CityCare Hospital
                </h3>

                <p>
                  Andheri West · 1.8 km
                </p>

                <div className="hospital-meta">

                  <span>
                    ● 12 doctors available
                  </span>

                  <span>
                    Live OPD
                  </span>

                </div>

              </div>

            </div>

            {/* WELLNESS */}

            <div className="hospital-card">

              <div className="hospital-image image-two">

                <span className="integrated">
                  Live Connected
                </span>

              </div>

              <div className="hospital-info">

                <h3>
                  Wellness Multispeciality
                </h3>

                <p>
                  Bandra · 3.2 km
                </p>

                <div className="hospital-meta">

                  <span>
                    ● 8 doctors available
                  </span>

                  <span>
                    Live OPD
                  </span>

                </div>

              </div>

            </div>

            {/* METRO HEALTH */}

            <div className="hospital-card">

              <div className="hospital-image image-three">

                <span className="listed">
                  Listed Hospital
                </span>

              </div>

              <div className="hospital-info">

                <h3>
                  Metro Health Centre
                </h3>

                <p>
                  Santacruz · 4.1 km
                </p>

                <div className="hospital-meta">

                  <span>
                    Information only
                  </span>

                  <span>
                    Not connected
                  </span>

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