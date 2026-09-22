# 🏥 HospitalFlow

### Real-Time OPD Coordination & Smart Queue Management Platform

> **Know your wait. Plan your time.**

HospitalFlow is a smart multi-hospital OPD coordination platform designed to reduce uncertainty and unnecessary waiting for patients while helping hospitals manage their OPD operations efficiently.

Instead of simply booking an appointment, HospitalFlow provides **real-time OPD visibility, digital tokens, dynamic queues, live doctor status, and AI-powered waiting-time estimation.**

---

## 🚨 The Problem

Traditional hospital appointment systems often tell patients **when to arrive**, but not **what is actually happening inside the OPD**.

Patients may face:

- ⏳ Long and unpredictable waiting times
- 🏥 Difficulty comparing hospitals and doctors
- 🎟️ No real-time visibility of token queues
- 👨‍⚕️ Unexpected doctor delays
- 📞 Lack of timely updates
- 🚑 Sudden emergency/priority cases affecting the queue

Hospitals also struggle with efficiently coordinating doctors, appointments, patients and OPD queues.

---

## 💡 Our Solution

**HospitalFlow connects patients and hospitals through a real-time OPD coordination system.**

### For Patients

- 🔎 Search hospitals, doctors and departments
- 📅 Book OPD appointments
- 🎟️ Get digital queue tokens
- 📊 Track live OPD queues
- 🤖 Get AI-based waiting-time estimates
- 🔔 Receive real-time queue updates
- 🏥 Compare available hospitals
- 👨‍⚕️ Check doctor availability

### For Hospitals

- 👨‍⚕️ Manage doctors and departments
- 🎟️ Manage OPD tokens and queues
- 📅 Manage appointments
- 🟢 Update doctor availability
- 🚨 Handle emergency/priority patients
- 📊 Monitor OPD operations
- 📈 View operational analytics


### 🔄 Patient Workflow

The HospitalFlow patient journey follows a real-time OPD coordination workflow:

1. 🔍 **Search Hospital** – Find hospitals, departments, and available doctors.
2. 👨‍⚕️ **Select Doctor** – View doctor availability and OPD details.
3. 📅 **Book Appointment** – Schedule an OPD appointment.
4. 🎟️ **Receive Digital Token** – Get a queue token after booking.
5. 📊 **Track Live Queue** – Monitor the current queue and token progression.
6. 🤖 **View Waiting-Time Estimate** – Receive an AI-based estimate of the expected waiting time.

**Patient → Hospital Search → Doctor Selection → Appointment → Digital Token → Live Queue → AI Waiting-Time Estimate**

---

## 🤖 AI-Powered Waiting Time Prediction

HospitalFlow doesn't provide a fixed or guaranteed waiting time.

Instead, the system estimates a **dynamic waiting-time range** based on factors such as:

- Number of patients waiting
- Current queue position
- Average consultation duration
- Doctor delay
- Priority/emergency cases
- Historical OPD patterns
- Current queue conditions

### Example

```text
Your Token: A24

Patients Ahead: 2

Estimated Waiting Time:
🕐 40 – 55 minutes

Doctor Status:
🟢 Available
                    ┌─────────────────────┐
                    │   Patient Frontend  │
                    │ React + TypeScript  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Spring Boot API   │
                    │   Core Backend       │
                    └───────┬─────┬───────┘
                            │     │
                 ┌──────────┘     └──────────┐
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │   PostgreSQL    │         │      Redis      │
        │  Persistent DB  │         │ Cache / Live    │
        └─────────────────┘         │ Queue State     │
                                    └─────────────────┘
                            
                    ┌─────────────────────┐
                    │   Python AI Service │
                    │ FastAPI + ML        │
                    └─────────────────────┘

                    ┌─────────────────────┐
                    │    Admin Frontend   │
                    │ React + TypeScript  │
                    └─────────────────────┘
| Layer                   | Technology                |
| ----------------------- | ------------------------- |
| Patient Frontend        | React + TypeScript + Vite |
| Admin Frontend          | React + TypeScript + Vite |
| Backend                 | Java + Spring Boot        |
| Database                | PostgreSQL                |
| ORM                     | JPA / Hibernate           |
| Authentication          | Spring Security + JWT     |
| Password Security       | BCrypt                    |
| Real-Time Communication | WebSocket                 |
| Cache                   | Redis                     |
| AI Service              | Python + FastAPI          |
| Data Processing         | Pandas + NumPy            |
| Machine Learning        | Scikit-learn              |
| Icons/UI                | Lucide React              |
| Containerization        | Docker                    |
| Version Control         | Git + GitHub              |
🔐 Security

HospitalFlow is designed with security and privacy in mind.

🔑 JWT-based authentication
👥 Role-based access control
🔒 BCrypt password hashing
🔐 HTTPS-ready architecture
📝 Audit logging
🛡️ Minimal patient information exposure
🎟️ Queue identification using tokens instead of unnecessary medical information
🏥 Multi-Hospital Model

HospitalFlow is designed as a multi-hospital platform.

Hospitals can either provide:

🟢 Integrated Data

Real-time:

Doctor status
OPD queue
Tokens
Appointments
Waiting-time estimates
Notifications
🔵 Listed Hospital

Basic hospital information is available, but live OPD data is shown only when the hospital is actually connected to the platform.

This avoids presenting simulated information as real hospital data.

HospitalFlow/
│
├── patient-frontend/
│   └── React + TypeScript
│
├── admin-frontend/
│   └── React + TypeScript
│
├── backend/
│   └── Spring Boot
│
├── ai-service/
│   └── Python + FastAPI
│
├── database/
│   └── Database scripts
│
└── docs/
    └── Project documentation
🔮 Future Scope
📱 Mobile application
🏥 Integration with hospital HIS/EMR systems
🗺️ Hospital discovery and navigation
📲 WhatsApp/SMS notifications
🧠 Advanced ML-based queue prediction
☁️ Cloud deployment
📊 Hospital performance analytics
🔄 Inter-hospital OPD coordination
🌐 Large-scale multi-hospital deployment
