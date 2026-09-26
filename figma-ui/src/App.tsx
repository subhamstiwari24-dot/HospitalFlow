import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// ==================== PATIENT ====================

import PatientEntryPage from './pages/patient/PatientEntryPage';
import PatientLoginPage from './pages/patient/PatientLoginPage';
import PatientRegisterPage from './pages/patient/PatientRegisterPage';
import ForgotPasswordPage from './pages/patient/ForgotPasswordPage';
import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import OPDHistoryPage from './pages/patient/OPDHistoryPage';

import SearchHospitalPage from './pages/patient/SearchHospitalPage';
import SelectDepartmentPage from './pages/patient/SelectDepartmentPage';
import SelectDoctorPage from './pages/patient/SelectDoctorPage';
import BookOPDPage from './pages/patient/BookOPDPage';
import BookingConfirmationPage from './pages/patient/BookingConfirmationPage';
import TokenDetailsPage from './pages/patient/TokenDetailsPage';
import LiveQueuePage from './pages/patient/LiveQueuePage';
import AppointmentDetailsPage from './pages/patient/AppointmentDetailsPage';

// ==================== CONTEXT ====================

import { PatientProvider } from './context/PatientContext';
import { SharedQueueProvider } from './context/SharedQueueContext';

// ==================== ADMIN ====================

import AdminDashboardPage from './pages/admin/AdminDashboardPage';

import DoctorManagementPage from './pages/admin/DoctorManagementPage';
import AddDoctorPage from './pages/admin/AddDoctorPage';
import EditDoctorPage from './pages/admin/EditDoctorPage';

import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import DepartmentDetailsPage from './pages/admin/DepartmentDetailsPage';
import AddDepartmentPage from './pages/admin/AddDepartmentPage';

import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';


// =====================================================
// PATIENT ROUTES
// =====================================================

function PatientRoutes() {
  return (
    <PatientProvider>
      <Routes>

        {/* Patient Login */}
        <Route
          path="login"
          element={<PatientLoginPage />}
        />

        {/* Patient Register */}
        <Route
          path="register"
          element={<PatientRegisterPage />}
        />

        <Route
          path="forgot-password"
          element={<ForgotPasswordPage />}
        />

        {/* Patient Dashboard */}
        <Route
          path="dashboard"
          element={<PatientDashboardPage />}
        />

        {/* My Appointments */}
        <Route
          path="appointments"
          element={<MyAppointmentsPage />}
        />

        {/* OPD History */}
        <Route
          path="history"
          element={<OPDHistoryPage />}
        />

        {/* Patient Entry / Guest Booking */}
        <Route
          path=""
          element={<PatientEntryPage />}
        />

        {/* Hospital Selection */}
        <Route
          path="hospital"
          element={<SearchHospitalPage />}
        />

        {/* Department Selection */}
        <Route
          path="department"
          element={<SelectDepartmentPage />}
        />

        {/* Doctor Selection */}
        <Route
          path="doctor"
          element={<SelectDoctorPage />}
        />

        {/* OPD Booking */}
        <Route
          path="book"
          element={<BookOPDPage />}
        />

        {/* Booking Confirmation */}
        <Route
          path="confirmation"
          element={<BookingConfirmationPage />}
        />

        {/* Token Details */}
        <Route
          path="token"
          element={<TokenDetailsPage />}
        />

        {/* Live Queue */}
        <Route
          path="queue"
          element={<LiveQueuePage />}
        />

        {/* Appointment Details */}
        <Route
          path="appointment"
          element={<AppointmentDetailsPage />}
        />

        {/* Unknown Patient Route */}
        <Route
          path="*"
          element={<Navigate to="" replace />}
        />

      </Routes>
    </PatientProvider>
  );
}


// =====================================================
// DOCTOR ROUTES
// =====================================================

function DoctorRoutes() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
        }}
      >
        <h2>Doctor Dashboard</h2>

        <p>
          Doctor module will be connected here.
        </p>
      </div>
    </div>
  );
}


// =====================================================
// ADMIN ROUTES
// =====================================================

function AdminRoutes() {
  return (
    <Routes>

      {/* Admin Dashboard */}
      <Route
        path="dashboard"
        element={<AdminDashboardPage />}
      />

      {/* ==================== DOCTORS ==================== */}

      <Route
        path="doctors"
        element={<DoctorManagementPage />}
      />

      <Route
        path="doctors/add"
        element={<AddDoctorPage />}
      />

      <Route
        path="doctors/:doctorId/edit"
        element={<EditDoctorPage />}
      />

      {/* ==================== DEPARTMENTS ==================== */}

      <Route
        path="departments"
        element={<DepartmentManagementPage />}
      />

      <Route
        path="departments/add"
        element={<AddDepartmentPage />}
      />

      <Route
        path="departments/:departmentId"
        element={<DepartmentDetailsPage />}
      />

      {/* ==================== APPOINTMENTS ==================== */}

      <Route
        path="appointments"
        element={<AdminAppointmentsPage />}
      />

      {/* Unknown Admin Route */}
      <Route
        path="*"
        element={<Navigate to="dashboard" replace />}
      />

    </Routes>
  );
}


// =====================================================
// MAIN APP
// =====================================================

export default function App() {
  return (
    <SharedQueueProvider>

      <BrowserRouter>

        <Routes>

          {/* Landing Page */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* Staff Login */}
          <Route
            path="/login"
            element={<LoginPage />}
          />

          {/* Doctor */}
          <Route
            path="/doctor/*"
            element={<DoctorRoutes />}
          />

          {/* Admin */}
          <Route
            path="/admin/*"
            element={<AdminRoutes />}
          />

          {/* Patient */}
          <Route
            path="/patient/*"
            element={<PatientRoutes />}
          />

          {/* Unknown Route */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>

      </BrowserRouter>

    </SharedQueueProvider>
  );
}