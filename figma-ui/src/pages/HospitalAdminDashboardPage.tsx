import React from 'react';
import { useNavigate } from 'react-router-dom';

const HOSPITAL_ADMIN_TOKEN_KEY = 'hospitalflow_hospital_admin_token';
const HOSPITAL_ADMIN_KEY = 'hospitalflow_hospital_admin';

const HospitalAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const adminData = JSON.parse(
    sessionStorage.getItem(HOSPITAL_ADMIN_KEY) || '{}'
  );

  const hospitalName = adminData?.hospitalName || 'ABC Multispeciality Hospital';
  const adminName = adminData?.name || 'Hospital Administrator';

  const handleLogout = () => {
    sessionStorage.removeItem(HOSPITAL_ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(HOSPITAL_ADMIN_KEY);
    navigate('/hospital-admin/login');
  };

  return (
    <div className="hospital-admin-dashboard-page min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              HospitalFlow
            </h1>
            <p className="text-sm text-slate-500">
              Hospital Admin Portal
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">
                {adminName}
              </p>
              <p className="text-xs text-slate-500">
                Hospital Administrator
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <p className="mb-1 text-sm font-medium text-teal-600">
            Hospital Administration
          </p>

          <h2 className="text-3xl font-bold text-slate-900">
            Welcome back, {adminName}
          </h2>

          <p className="mt-2 text-slate-500">
            Manage your hospital operations from one place.
          </p>
        </div>

        {/* Hospital Card */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Your Hospital
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            {hospitalName}
          </h3>

          <div className="mt-4 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            ● Active
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Doctors</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-400">
              Hospital doctors
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Departments</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-400">
              Active departments
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Appointments</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-400">
              Today's appointments
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Patients</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">0</p>
            <p className="mt-1 text-xs text-slate-400">
              Today's patients
            </p>
          </div>
        </div>

        {/* Management */}
        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            Hospital Management
          </h3>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <button
              onClick={() => navigate('/hospital-admin/doctors')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">👨‍⚕️</div>
              <h4 className="font-semibold text-slate-900">
                Doctor Management
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Add, update and manage doctors belonging to your hospital.
              </p>
            </button>

            <button
              onClick={() => navigate('/hospital-admin/departments')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">🏢</div>
              <h4 className="font-semibold text-slate-900">
                Department Management
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Manage departments, rooms and department status.
              </p>
            </button>

            <button
              onClick={() => navigate('/hospital-admin/appointments')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">📅</div>
              <h4 className="font-semibold text-slate-900">
                Appointments
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Monitor and manage your hospital appointments.
              </p>
            </button>

            <button
              onClick={() => navigate('/hospital-admin/patients')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">👥</div>
              <h4 className="font-semibold text-slate-900">
                Patients
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                View patients and their OPD activity.
              </p>
            </button>

            <button
              onClick={() => navigate('/hospital-admin/queues')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">🎫</div>
              <h4 className="font-semibold text-slate-900">
                OPD Queues
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Monitor live OPD queues and token activity.
              </p>
            </button>

            <button
              onClick={() => navigate('/hospital-admin/settings')}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
            >
              <div className="mb-4 text-3xl">⚙️</div>
              <h4 className="font-semibold text-slate-900">
                Hospital Settings
              </h4>
              <p className="mt-2 text-sm text-slate-500">
                Manage hospital information and administrator settings.
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalAdminDashboardPage;