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

// ==================== DOCTOR ====================

import DoctorDashboardPage from './pages/doctor/DashboardPage';
import DoctorQueuePage from './pages/doctor/QueuePage';
import DoctorAppointmentsPage from './pages/doctor/AppointmentsPage';
import DoctorPatientDetailsPage from './pages/doctor/PatientDetailsPage';

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

        <Route
          path="login"
          element={<PatientLoginPage />}
        />

        <Route
          path="register"
          element={<PatientRegisterPage />}
        />

        <Route
          path="forgot-password"
          element={<ForgotPasswordPage />}
        />

        <Route
          path="dashboard"
          element={<PatientDashboardPage />}
        />

        <Route
          path="appointments"
          element={<MyAppointmentsPage />}
        />

        <Route
          path="history"
          element={<OPDHistoryPage />}
        />

        <Route
          path=""
          element={<PatientEntryPage />}
        />

        <Route
          path="hospital"
          element={<SearchHospitalPage />}
        />

        <Route
          path="department"
          element={<SelectDepartmentPage />}
        />

        <Route
          path="doctor"
          element={<SelectDoctorPage />}
        />

        <Route
          path="book"
          element={<BookOPDPage />}
        />

        <Route
          path="confirmation"
          element={<BookingConfirmationPage />}
        />

        <Route
          path="token"
          element={<TokenDetailsPage />}
        />

        <Route
          path="queue"
          element={<LiveQueuePage />}
        />

        <Route
          path="appointment"
          element={<AppointmentDetailsPage />}
        />

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
    <Routes>

      {/* Doctor Dashboard */}
      <Route
        path="dashboard"
        element={<DoctorDashboardPage />}
      />

      {/* Doctor Queue */}
      <Route
        path="queue"
        element={<DoctorQueuePage />}
      />

      {/* Doctor Appointments */}
      <Route
        path="appointments"
        element={<DoctorAppointmentsPage />}
      />

      {/* Doctor Patient Details */}
      <Route
        path="patients"
        element={<DoctorPatientDetailsPage />}
      />

      {/* Default Doctor Route */}
      <Route
        path=""
        element={
          <Navigate
            to="dashboard"
            replace
          />
        }
      />

      {/* Unknown Doctor Route */}
      <Route
        path="*"
        element={
          <Navigate
            to="dashboard"
            replace
          />
        }
      />

    </Routes>
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
        element={
          <Navigate
            to="dashboard"
            replace
          />
        }
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

          {/* Landing */}
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

          {/* Unknown */}
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </SharedQueueProvider>
  );
}