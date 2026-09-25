import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SharedQueueProvider } from './context/SharedQueueContext';
import { QueueProvider } from './context/QueueContext';
import { AdminProvider } from './context/AdminContext';
import { PatientProvider } from './context/PatientContext';

import LoginPage from './pages/LoginPage';

// Doctor pages
import DashboardPage from './pages/doctor/DashboardPage';
import QueuePage from './pages/doctor/QueuePage';
import AppointmentsPage from './pages/doctor/AppointmentsPage';
import PatientDetailsPage from './pages/doctor/PatientDetailsPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DoctorManagementPage from './pages/admin/DoctorManagementPage';
import AddDoctorPage from './pages/admin/AddDoctorPage';
import EditDoctorPage from './pages/admin/EditDoctorPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import DepartmentDetailsPage from './pages/admin/DepartmentDetailsPage';
import AddDepartmentPage from './pages/admin/AddDepartmentPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminPatientManagementPage from './pages/admin/AdminPatientManagementPage';
import AdminPatientDetailPage from './pages/admin/AdminPatientDetailPage';
import AdminAppointmentDetailPage from './pages/admin/AdminAppointmentDetailPage';

// Patient pages
import PatientEntryPage from './pages/patient/PatientEntryPage';
import SearchHospitalPage from './pages/patient/SearchHospitalPage';
import SelectDepartmentPage from './pages/patient/SelectDepartmentPage';
import SelectDoctorPage from './pages/patient/SelectDoctorPage';
import BookOPDPage from './pages/patient/BookOPDPage';
import BookingConfirmationPage from './pages/patient/BookingConfirmationPage';
import TokenDetailsPage from './pages/patient/TokenDetailsPage';
import LiveQueuePage from './pages/patient/LiveQueuePage';
import AppointmentDetailsPage from './pages/patient/AppointmentDetailsPage';

function DoctorRoutes() {
  return (
    <QueueProvider>
      <Routes>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="patients" element={<PatientDetailsPage />} />
        <Route path="settings" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </QueueProvider>
  );
}

function AdminRoutes() {
  return (
    <AdminProvider>
      <Routes>
        <Route path="dashboard" element={<AdminDashboardPage />} />

        {/* Doctor management */}
        <Route path="doctors" element={<DoctorManagementPage />} />
        <Route path="doctors/add" element={<AddDoctorPage />} />
        <Route path="doctors/:id/edit" element={<EditDoctorPage />} />

        {/* Department management */}
        <Route path="departments" element={<DepartmentManagementPage />} />
        <Route path="departments/add" element={<AddDepartmentPage />} />
        <Route path="departments/:id" element={<DepartmentDetailsPage />} />

        {/* Shared / stub routes */}
        <Route path="appointments/:appointmentId" element={<AdminAppointmentDetailPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="queue" element={<QueuePage />} />
        <Route path="patients/:appointmentId" element={<AdminPatientDetailPage />} />
        <Route path="patients" element={<AdminPatientManagementPage />} />
        <Route path="settings" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminProvider>
  );
}

function PatientRoutes() {
  return (
    <PatientProvider>
      <Routes>
        <Route path="" element={<PatientEntryPage />} />
        <Route path="hospital" element={<SearchHospitalPage />} />
        <Route path="department" element={<SelectDepartmentPage />} />
        <Route path="doctor" element={<SelectDoctorPage />} />
        <Route path="book" element={<BookOPDPage />} />
        <Route path="confirmation" element={<BookingConfirmationPage />} />
        <Route path="token" element={<TokenDetailsPage />} />
        <Route path="queue" element={<LiveQueuePage />} />
        <Route path="appointment" element={<AppointmentDetailsPage />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Routes>
    </PatientProvider>
  );
}

export default function App() {
  return (
    <SharedQueueProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/doctor/*" element={<DoctorRoutes />} />
          <Route path="/admin/*" element={<AdminRoutes />} />
          <Route path="/patient/*" element={<PatientRoutes />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </SharedQueueProvider>
  );
}
