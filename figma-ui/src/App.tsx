import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// ==================== COMMON ====================

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

import HospitalPortalPage from './pages/HospitalPortalPage';
import HospitalAdminLoginPage from './pages/HospitalAdminLoginPage';
import HospitalAdminDashboardPage from './pages/HospitalAdminDashboardPage';
import HospitalRegistrationPage from './pages/HospitalRegistrationPage';

import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';

// ==================== PATIENT ====================

import PatientEntryPage from './pages/patient/PatientEntryPage';
import PatientLoginPage from './pages/patient/PatientLoginPage';
import PatientRegisterPage from './pages/patient/PatientRegisterPage';
import ForgotPasswordPage from './pages/patient/ForgotPasswordPage';

import PatientDashboardPage from './pages/patient/PatientDashboardPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import OPDHistoryPage from './pages/patient/OPDHistoryPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

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
import { QueueProvider } from './context/QueueContext';

// ==================== DOCTOR ====================

import DoctorDashboardPage from './pages/doctor/DashboardPage';
import DoctorQueuePage from './pages/doctor/QueuePage';
import DoctorAppointmentsPage from './pages/doctor/AppointmentsPage';
import DoctorPatientDetailsPage from './pages/doctor/PatientDetailsPage';

// ==================== ADMIN ====================

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { AdminAuthProvider } from './context/AdminAuthContext';

import DoctorManagementPage from './pages/admin/DoctorManagementPage';
import AddDoctorPage from './pages/admin/AddDoctorPage';
import EditDoctorPage from './pages/admin/EditDoctorPage';

import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import DepartmentDetailsPage from './pages/admin/DepartmentDetailsPage';
import AddDepartmentPage from './pages/admin/AddDepartmentPage';

import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminAppointmentDetailPage from './pages/admin/AdminAppointmentDetailPage';
import SettingsPage from './pages/admin/SettingsPage';

// =====================================================
// PATIENT ROUTES
// =====================================================

function PatientRoutes() {
  return (
    <PatientProvider>
      <Routes>

        {/* ==================== AUTH ==================== */}

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

        {/* ==================== PATIENT MAIN ==================== */}

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

        {/* ==================== PATIENT PROFILE ==================== */}

        <Route
          path="profile"
          element={<PatientProfilePage />}
        />

        {/* ==================== GUEST / PATIENT ENTRY ==================== */}

        <Route
          path=""
          element={<PatientEntryPage />}
        />

        {/* ==================== BOOK OPD FLOW ==================== */}

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

        {/* ==================== UNKNOWN PATIENT ROUTE ==================== */}

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

      <Route
        path="dashboard"
        element={<DoctorDashboardPage />}
      />

      <Route
        path="queue"
        element={<DoctorQueuePage />}
      />

      <Route
        path="appointments"
        element={<DoctorAppointmentsPage />}
      />

      <Route
        path="patients"
        element={<DoctorPatientDetailsPage />}
      />

      <Route
        path=""
        element={
          <Navigate
            to="dashboard"
            replace
          />
        }
      />

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

      <Route element={<ProtectedAdminRoute />}>

        {/* ==================== NORMAL ADMIN DASHBOARD ==================== */}

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

        <Route
          path="appointments/:appointmentId"
          element={<AdminAppointmentDetailPage />}
        />

        {/* ==================== SETTINGS ==================== */}

        <Route
          path="settings"
          element={<SettingsPage />}
        />

      </Route>

      {/* ==================== UNKNOWN ADMIN ROUTE ==================== */}

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
    <BrowserRouter>

      {/*
        SharedQueueProvider must be outside QueueProvider
        because QueueProvider uses useSharedQueue().
      */}

      <SharedQueueProvider>

        {/*
          QueueProvider provides useQueue() to
          Doctor Dashboard / Doctor Queue / related pages.
        */}

        <QueueProvider>

          <AdminAuthProvider>

            <Routes>

              {/* ==================== LANDING ==================== */}

              <Route
                path="/"
                element={<LandingPage />}
              />

              {/* ==================== HOSPITAL PORTAL ==================== */}

              <Route
                path="/hospital-portal"
                element={<HospitalPortalPage />}
              />

              {/* ==================== STAFF LOGIN ==================== */}

              <Route
                path="/login"
                element={<LoginPage />}
              />

              {/* ==================== HOSPITAL ADMIN ==================== */}

              <Route
                path="/hospital-admin/login"
                element={<HospitalAdminLoginPage />}
              />

              <Route
                path="/hospital-admin/dashboard"
                element={<HospitalAdminDashboardPage />}
              />

              {/* ==================== HOSPITAL REGISTRATION ==================== */}

              <Route
                path="/hospital/register"
                element={<HospitalRegistrationPage />}
              />

              {/* ==================== SUPER ADMIN ==================== */}

              <Route
                path="/super-admin/dashboard"
                element={<SuperAdminDashboardPage />}
              />

              {/* ==================== DOCTOR ==================== */}

              <Route
                path="/doctor/*"
                element={<DoctorRoutes />}
              />

              {/* ==================== ADMIN ==================== */}

              <Route
                path="/admin/*"
                element={<AdminRoutes />}
              />

              {/* ==================== PATIENT ==================== */}

              <Route
                path="/patient/*"
                element={<PatientRoutes />}
              />

              {/* ==================== UNKNOWN ==================== */}

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

          </AdminAuthProvider>

        </QueueProvider>

      </SharedQueueProvider>

    </BrowserRouter>
  );
}