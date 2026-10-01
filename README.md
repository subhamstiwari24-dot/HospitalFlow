# 🏥 HospitalFlow

## Real-Time OPD Coordination & Smart Queue Management Platform

> **Know your wait. Plan your time.**

HospitalFlow is a smart **multi-hospital OPD coordination platform** designed to reduce uncertainty and unnecessary waiting for patients while helping hospitals manage their OPD operations efficiently.

Unlike traditional appointment systems that only provide an appointment time, HospitalFlow provides a complete digital OPD workflow including **hospital discovery, doctor availability, appointment booking, digital tokens, queue tracking, payment processing, and administrative management**.

The platform is designed to create a connection between patients and hospitals through a centralized digital OPD management system.

---

# 🚨 Problem Statement

Traditional hospital appointment systems often tell patients **when to arrive**, but do not provide sufficient information about what is actually happening inside the OPD.

Patients may face:

* ⏳ Long and unpredictable waiting times
* 🏥 Difficulty finding suitable hospitals and doctors
* 🎟️ No real-time visibility of OPD token queues
* 👨‍⚕️ Unexpected doctor delays
* 📞 Lack of timely appointment updates
* 💳 No integrated digital payment experience
* 🚑 Sudden emergency or priority cases affecting queues
* 📅 Difficulty managing upcoming and previous appointments

Hospitals also face challenges in coordinating:

* Doctors
* Patients
* Appointments
* OPD slots
* Digital tokens
* Queue progression
* Doctor availability
* Payments
* Operational information

HospitalFlow aims to address these problems through a centralized digital OPD coordination platform.

---

# 💡 Our Solution

HospitalFlow connects patients and hospitals through a digital OPD management system.

The platform provides:

### 👨‍⚕️ For Patients

* 🔎 Search hospitals and doctors
* 🏥 View hospital information
* 👨‍⚕️ View doctor details and specialization
* 🟢 Check doctor availability
* 📅 Select available appointment slots
* 📝 Book OPD appointments
* 💳 Make online appointment payments
* 🎟️ Receive digital queue tokens
* 📊 Track appointment and queue status
* 🕐 View estimated waiting time
* 🔔 Receive appointment/queue notifications
* 📜 View appointment history

### 🏥 For Hospitals / Administrators

* 👨‍⚕️ Manage doctors
* 🏥 Manage hospital information
* 📅 Manage appointments
* 🎟️ Manage OPD tokens
* 🟢 Update doctor availability
* 📊 Monitor OPD operations
* 👥 Manage patient-related appointment information
* 💳 Monitor payment/booking status
* 📈 View operational information

---

# ✨ Key Features

## 🔐 1. User Authentication

HospitalFlow provides secure authentication for platform users.

### Features

* User registration/login
* Secure password handling
* JWT-based authentication
* Role-based access control
* Protected frontend routes
* Separate patient and admin experiences
* Session/authentication state management

The authentication system ensures that users can access only the features associated with their role.

---

# 👤 2. Patient Dashboard

After successful login, patients can access their personalized dashboard.

The dashboard provides information such as:

* 👋 Patient profile
* 📅 Upcoming appointments
* 🏥 Selected hospital
* 👨‍⚕️ Doctor information
* 🎟️ Digital token
* 📊 Queue position
* 🕐 Waiting-time information
* 💳 Payment status
* 📜 Appointment history

The patient dashboard acts as the central location for managing the patient's OPD journey.

---

# 🏥 3. Hospital Discovery

Patients can search and explore available hospitals.

Hospital information may include:

* Hospital name
* Location
* Available departments
* Available doctors
* Hospital details
* Doctor availability
* OPD information

HospitalFlow is designed to support multiple hospitals through a common platform.

---

# 👨‍⚕️ 4. Doctor Management

The system provides doctor-related information and management functionality.

### Doctor Information

* Doctor name
* Specialization
* Qualification
* Experience
* Consultation duration
* Availability/status
* Associated hospital

### Admin Capabilities

Administrators can manage doctor information and update doctor availability according to the hospital's OPD operations.

---

# 📅 5. Appointment Booking

Patients can book OPD appointments through the platform.

### Appointment Flow

```text
Search Hospital
      ↓
Select Doctor
      ↓
Select Date
      ↓
View Available Slots
      ↓
Select Slot
      ↓
Confirm Appointment
      ↓
Make Payment
      ↓
Appointment Confirmation
      ↓
Digital Token
```

The system is designed to prevent booking unavailable slots and maintain appointment information in the backend database.

---

# 💳 6. Online Payment Gateway

HospitalFlow also includes an **online payment gateway** for appointment/OPD booking.

Instead of treating payment as a separate process, payment is integrated into the appointment workflow.

### Payment Flow

```text
Select Doctor
      ↓
Select Date & Slot
      ↓
Enter/Confirm Appointment Details
      ↓
Proceed to Payment
      ↓
Payment Gateway
      ↓
Payment Verification
      ↓
Payment Successful
      ↓
Appointment Confirmed
      ↓
Digital Token Generated
```

### Payment Features

* 💳 Online payment
* 🔄 Payment processing
* ✅ Successful payment handling
* ❌ Failed payment handling
* 📌 Payment/transaction status
* 🔗 Appointment-payment association
* 🧾 Payment information associated with the booking

> Payment functionality is intended to ensure that the appointment booking process and payment status remain synchronized.

---

# 🎟️ 7. Digital Token System

After a successful appointment/booking process, the patient can receive a digital OPD token.

Example:

```text
Token: A24

Doctor: Dr. Sharma
Department: General Medicine

Patients Ahead: 2

Status: Waiting
```

The token system helps patients understand their position in the OPD queue without requiring physical token slips.

---

# 📊 8. Live OPD Queue Management

HospitalFlow is designed to provide real-time visibility into OPD queues.

Patients can view:

* Current token
* Their token
* Patients ahead
* Queue progress
* Doctor status
* Appointment status

Example:

```text
Current Token     : A22
Your Token        : A24
Patients Ahead    : 2

Queue Status      : 🟢 Active
Doctor Status     : 🟢 Available
```

The queue can dynamically change based on the progress of consultations and hospital operations.

---

# 🕐 9. Waiting-Time Estimation

HospitalFlow is designed to provide a **dynamic waiting-time estimate** instead of displaying a fixed guaranteed waiting time.

The estimated waiting time can consider factors such as:

* Number of patients waiting
* Current queue position
* Average consultation duration
* Doctor availability
* Doctor delays
* Priority/emergency patients
* Historical OPD patterns
* Current queue conditions

Example:

```text
Your Token: A24

Patients Ahead: 2

Estimated Waiting Time:
40 – 55 minutes

Doctor Status:
🟢 Available
```

### 🤖 AI/ML Extension

Advanced ML-based prediction is part of the planned architecture.

The future AI service can use:

```text
Queue Data
    +
Historical OPD Data
    +
Consultation Duration
    +
Doctor Status
    +
Priority Cases
        ↓
Python ML Service
        ↓
Waiting-Time Prediction
```

---

# 🔔 10. Notifications

HospitalFlow is designed to keep patients informed about important appointment and queue events.

Potential notifications include:

* 📅 Appointment confirmation
* 💳 Payment confirmation
* 🎟️ Token generation
* 📊 Queue updates
* 👨‍⚕️ Doctor availability changes
* 🕐 Waiting-time changes
* 🚨 Important OPD updates

Additional communication channels such as WhatsApp and SMS are planned for future versions.

---

# 🛠️ 11. Admin Dashboard

HospitalFlow provides a dedicated administration interface separate from the patient interface.

The Admin Dashboard is designed for managing hospital OPD operations.

### Admin Features

#### 🏥 Hospital Management

* View hospital information
* Manage hospital details
* Manage hospital-related data

#### 👨‍⚕️ Doctor Management

* Add doctors
* View doctors
* Update doctor information
* Manage specialization
* Manage doctor availability

#### 📅 Appointment Management

* View appointments
* Monitor appointment status
* Manage appointment-related information

#### 🎟️ Queue Management

* Monitor OPD tokens
* Track queue progression
* Manage current queue information

#### 📊 Operations

* Monitor OPD activity
* View operational information
* Track doctor/appointment activity

---

# 🔄 Complete Patient Workflow

The HospitalFlow patient journey follows a complete digital OPD workflow:

```text
┌──────────────────────┐
│   Patient Login      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Search Hospital     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Select Doctor      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Select Date & Slot   │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Book Appointment     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Online Payment     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Payment Verification  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Appointment Confirmed│
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  Digital Token       │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Live OPD Queue     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Waiting-Time Estimate│
└──────────────────────┘
```

---

# 🏥 Multi-Hospital Architecture

HospitalFlow is designed as a multi-hospital platform.

Hospitals can have different levels of integration.

### 🟢 Integrated Hospital

A connected hospital can provide real-time information such as:

* Doctor status
* OPD queue
* Digital tokens
* Appointments
* Waiting-time estimates
* Notifications

### 🔵 Listed Hospital

A listed hospital may provide basic information such as:

* Hospital name
* Location
* Departments
* Doctors
* General information

Live OPD data is displayed only when the hospital is actually integrated with HospitalFlow.

This approach helps avoid presenting simulated information as real hospital data.

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │   Patient Frontend   │
                         │ React + TypeScript   │
                         │       + Vite         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Spring Boot API   │
                         │     Core Backend     │
                         └───────┬──────┬───────┘
                                 │      │
                    ┌────────────┘      └─────────────┐
                    ▼                                 ▼
           ┌─────────────────┐               ┌─────────────────┐
           │   PostgreSQL    │               │      Redis      │
           │ Persistent Data │               │ Cache / Live    │
           │                 │               │ Queue State     │
           └─────────────────┘               └─────────────────┘
                    │
                    ▼
           ┌─────────────────────┐
           │  Python AI Service  │
           │   FastAPI + ML      │
           └─────────────────────┘

                         ┌──────────────────────┐
                         │    Admin Frontend    │
                         │ React + TypeScript   │
                         │       + Vite         │
                         └──────────────────────┘
```

---

# 🧩 Technology Stack

| Layer                   | Technology                |
| ----------------------- | ------------------------- |
| Patient Frontend        | React + TypeScript + Vite |
| Admin Frontend          | React + TypeScript + Vite |
| UI                      | Modern Responsive UI      |
| Icons                   | Lucide React              |
| Backend                 | Java + Spring Boot        |
| ORM                     | JPA / Hibernate           |
| Database                | PostgreSQL                |
| Authentication          | Spring Security + JWT     |
| Password Security       | BCrypt                    |
| API                     | REST APIs                 |
| Real-Time Communication | WebSocket                 |
| Cache                   | Redis                     |
| AI Service              | Python + FastAPI          |
| Data Processing         | Pandas + NumPy            |
| Machine Learning        | Scikit-learn              |
| Payment                 | Online Payment Gateway    |
| Containerization        | Docker                    |
| Version Control         | Git + GitHub              |

---

# 🔐 Security

HospitalFlow is designed with security and privacy as important parts of the architecture.

### Security Features

* 🔑 JWT-based authentication
* 👥 Role-based access control
* 🔒 BCrypt password hashing
* 🛡️ Protected API endpoints
* 🔐 HTTPS-ready architecture
* 📝 Audit logging architecture
* 🎟️ Token-based queue identification
* 👤 Minimal exposure of patient information
* 🔒 Secure authentication between frontend and backend

Sensitive patient information should not be unnecessarily exposed through the queue interface.

---

# 🗄️ Database

HospitalFlow uses **PostgreSQL** as its primary persistent database.

The backend follows a relational data model using **JPA/Hibernate**.

The database is designed to manage information related to:

* Users
* Patients
* Hospitals
* Doctors
* Departments
* Appointments
* Slots
* Tokens
* Queue information
* Payments
* Authentication
* Notifications

The exact database schema can evolve as additional modules are implemented.

---

# 🔌 Backend

The backend is developed using:

```text
Java
Spring Boot
Spring Security
JPA / Hibernate
PostgreSQL
Redis
REST APIs
```

The backend acts as the central coordination layer between:

```text
Patient Frontend
        ↓
Spring Boot Backend
        ↓
Database / Redis / Services
        ↓
Admin Frontend
```

Backend responsibilities include:

* Authentication
* User management
* Hospital management
* Doctor management
* Appointment management
* Slot management
* Token generation
* Queue management
* Payment-related processing
* Notification-related processing
* API communication

---

# 💻 Frontend

HospitalFlow contains separate frontend applications for patients and administrators.

## Patient Frontend

Built using:

```text
React
TypeScript
Vite
Lucide React
```

Main areas include:

* Login
* Patient entry
* Hospital search
* Doctor selection
* Appointment booking
* Payment
* Patient dashboard
* Appointment view
* Queue/token information
* Profile/settings

## Admin Frontend

The admin interface is separated from the patient interface.

It focuses on:

* Hospital operations
* Doctor management
* Appointment management
* Queue monitoring
* Operational information

---

# 💳 Payment & Appointment Relationship

Payment is integrated with the appointment workflow.

Conceptually:

```text
Appointment Created
        ↓
Payment Initiated
        ↓
Payment Gateway
        ↓
Payment Result
   ↙           ↘
Success       Failure
   ↓             ↓
Confirm        Payment
Appointment    Failed
   ↓
Generate Token
```

This ensures that payment status can be associated with the corresponding appointment.

---

# 📁 Project Structure

```text
HospitalFlow/
│
├── patient-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── admin-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── pom.xml
│   └── ...
│
├── ai-service/
│   └── Python + FastAPI
│
├── database/
│   └── Database scripts
│
└── docs/
    └── Project documentation
```

---

# 🚀 Local Development Setup

## 1. Clone Repository

```bash
git clone <repository-url>
cd HospitalFlow
```

---

## 2. Backend Setup

Navigate to the backend:

```bash
cd backend
```

Build the project:

```bash
mvn clean install
```

Run the Spring Boot application:

```bash
mvn spring-boot:run
```

The backend will start on the configured Spring Boot port.

---

# 3. Patient Frontend Setup

Open a new terminal:

```bash
cd patient-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# 4. Admin Frontend Setup

Open another terminal:

```bash
cd admin-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# 5. Database Setup

Install and configure PostgreSQL.

Create the required database and configure the database connection in the Spring Boot application configuration.

Example configuration:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/hospitalflow
spring.datasource.username=<username>
spring.datasource.password=<password>
```

> Do not commit real database credentials, API keys, payment credentials or JWT secrets to GitHub.

---

# 🔑 Environment Variables

Sensitive configuration should be stored using environment variables or appropriate configuration files.

Examples include:

```text
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD

JWT_SECRET

PAYMENT_API_KEY
PAYMENT_SECRET

REDIS_HOST
REDIS_PORT

AI_SERVICE_URL
```

Never expose production secrets in the public repository.

---

# 📌 Current Development Status

## ✅ Implemented / Developed

* ✅ React + TypeScript patient frontend
* ✅ React + TypeScript admin frontend
* ✅ Vite-based frontend setup
* ✅ Patient authentication/login flow
* ✅ Backend authentication infrastructure
* ✅ JWT-based authentication architecture
* ✅ Hospital management
* ✅ Doctor management
* ✅ Appointment management
* ✅ Doctor availability/status
* ✅ Appointment slot management
* ✅ Patient dashboard
* ✅ Appointment viewing
* ✅ Digital token/queue architecture
* ✅ Payment gateway integration
* ✅ Payment status handling
* ✅ Spring Boot backend
* ✅ PostgreSQL database integration
* ✅ JPA/Hibernate integration
* ✅ Separate admin interface
* ✅ Git/GitHub project setup

---

# 🚧 In Development

The following modules can be further connected and improved as the project progresses:

* 🚧 Complete real-time queue synchronization
* 🚧 WebSocket-based live queue updates
* 🚧 Advanced notification system
* 🚧 Production-ready payment verification/webhook handling
* 🚧 Complete Redis integration
* 🚧 AI waiting-time prediction service
* 🚧 Operational analytics
* 🚧 Hospital-side real-time integration

---

# 🔮 Future Scope

HospitalFlow can be extended with:

### 📱 Mobile Application

Native Android/iOS applications for patients and hospital staff.

### 🏥 HIS / EMR Integration

Integration with existing hospital systems to retrieve:

* Doctor schedules
* OPD data
* Patient appointments
* Queue information

### 🗺️ Hospital Navigation

Integration with map services for:

* Hospital discovery
* Navigation
* Distance estimation
* Route planning

### 📲 WhatsApp / SMS Notifications

Patients could receive:

* Appointment reminders
* Token updates
* Queue alerts
* Doctor availability updates

### 🧠 Advanced ML Prediction

The AI system can be improved using historical OPD data to provide more accurate waiting-time predictions.

### ☁️ Cloud Deployment

Deploy HospitalFlow using cloud infrastructure for scalable multi-hospital operation.

### 📊 Hospital Analytics

Provide hospitals with analytics related to:

* OPD load
* Average waiting time
* Doctor utilization
* Appointment volume
* Peak OPD hours
* Queue performance

### 🔄 Inter-Hospital OPD Coordination

Future versions could enable patients to compare real-time availability across multiple integrated hospitals.

---

# 🎯 Project Goals

HospitalFlow aims to:

1. Reduce uncertainty around OPD waiting times.
2. Improve appointment management.
3. Provide digital queue visibility.
4. Reduce unnecessary physical waiting.
5. Improve hospital operational coordination.
6. Provide secure digital payments.
7. Improve communication between patients and hospitals.
8. Build a scalable multi-hospital OPD platform.

---

# 🌟 Why HospitalFlow?

Traditional appointment systems primarily answer:

> **"When is your appointment?"**

HospitalFlow aims to answer a more useful question:

> **"What is happening with your appointment right now, and how long might you need to wait?"**

By combining:

```text
Hospital Discovery
        +
Doctor Availability
        +
Appointment Booking
        +
Online Payment
        +
Digital Tokens
        +
Queue Management
        +
Waiting-Time Estimation
        +
Notifications
        +
Hospital Administration
```

HospitalFlow provides a complete digital OPD coordination experience.

---

# 📜 Project Vision

> **Know your wait. Plan your time.**

HospitalFlow aims to transform OPD management from a traditional appointment-based system into a **real-time, transparent and digitally coordinated healthcare experience** for both patients and hospitals.

---

# 👨‍💻 Development

HospitalFlow is being developed as a full-stack healthcare technology project using modern web development, backend engineering, database management, authentication, payment integration and intelligent queue-management concepts.

### Core Technologies

```text
React
TypeScript
Vite
Java
Spring Boot
Spring Security
JPA / Hibernate
PostgreSQL
Redis
Python
FastAPI
Scikit-learn
Docker
Git
GitHub
```

---

# ⚠️ Disclaimer

HospitalFlow is an academic/prototype software project intended to demonstrate digital OPD coordination, appointment management, queue management and related technologies.

HospitalFlow does not replace professional medical advice, diagnosis or emergency medical services.

For medical emergencies, patients should contact the appropriate emergency medical service or healthcare provider.

---

# 📄 License

This project is currently developed for academic/project purposes.

License information can be added when the project is prepared for public/open-source distribution.
