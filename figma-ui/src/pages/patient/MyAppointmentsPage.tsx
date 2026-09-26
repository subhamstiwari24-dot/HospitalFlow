import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor?: {
    name?: string | null;
    specialization?: string | null;
    department?: {
      name?: string | null;
    } | null;
  } | null;
  hospital?: {
    name?: string | null;
    address?: string | null;
    city?: string | null;
  } | null;
}

export default function MyAppointmentsPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storedPatient = sessionStorage.getItem(
    'hospitalflow_patient'
  );

  const patient = storedPatient
    ? JSON.parse(storedPatient)
    : null;

  useEffect(() => {
    if (!patient?.phone) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/appointments/patient/${patient.phone}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch appointments');
        }

        const data = await response.json();

        setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          'Error fetching patient appointments:',
          err
        );

        setError(
          'Unable to load your appointments. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [patient?.phone]);

  const getStatusLabel = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'WAITING':
        return 'Waiting';

      case 'IN_PROGRESS':
        return 'In Progress';

      case 'COMPLETED':
        return 'Completed';

      case 'CANCELLED':
        return 'Cancelled';

      case 'SKIPPED':
        return 'Skipped';

      default:
        return status || 'Unknown';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'WAITING':
        return 'bg-[#fff5e8] text-[#b66a00]';

      case 'IN_PROGRESS':
        return 'bg-[#eaf3ff] text-[#155ead]';

      case 'COMPLETED':
        return 'bg-[#edf8f3] text-[#18865b]';

      case 'CANCELLED':
        return 'bg-[#fff1f2] text-[#c53a45]';

      case 'SKIPPED':
        return 'bg-[#f1f3f6] text-[#526176]';

      default:
        return 'bg-[#f1f3f6] text-[#526176]';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';

    const parsedDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAppointmentClick = (id: number) => {
    navigate(`/patient/appointment?id=${id}`);
  };

  if (!patient) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-[24px]">

        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[32px] text-center shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

          <h1 className="font-bold text-[#142033] text-[22px]">
            Login Required
          </h1>

          <p className="text-[#526176] text-[14px] mt-[8px]">
            Please login to view your appointments.
          </p>

          <button
            onClick={() => navigate('/patient/login')}
            className="bg-[#155ead] text-white font-semibold text-[13px] px-[20px] py-[11px] rounded-[9px] mt-[20px] cursor-pointer"
          >
            Patient Login →
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb]">

      {/* Header */}
      <header className="bg-white border-b border-[#d8e1ec]">

        <div className="max-w-[1100px] mx-auto px-[24px] h-[64px] flex items-center justify-between">

          <button
            onClick={() => navigate('/patient/dashboard')}
            className="cursor-pointer"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[34px] w-auto object-contain"
            />
          </button>

          <div className="flex items-center gap-[16px]">

            <div className="hidden sm:block text-right">

              <p className="font-semibold text-[#142033] text-[13px]">
                {patient.fullName}
              </p>

              <p className="text-[#7b899c] text-[11px]">
                {patient.phone}
              </p>

            </div>

            <button
              onClick={() => {
                sessionStorage.removeItem(
                  'hospitalflow_patient'
                );

                navigate('/patient/login');
              }}
              className="font-semibold text-[#c53a45] text-[12px] cursor-pointer hover:opacity-80"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* Main */}
      <main className="max-w-[1100px] mx-auto px-[24px] py-[36px]">

        {/* Page heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px] mb-[28px]">

          <div>

            <button
              onClick={() => navigate('/patient/dashboard')}
              className="text-[#155ead] text-[12px] font-semibold mb-[10px] cursor-pointer"
            >
              ← Back to Dashboard
            </button>

            <h1 className="font-bold text-[#142033] text-[28px]">
              My Appointments
            </h1>

            <p className="text-[#526176] text-[14px] mt-[5px]">
              View your upcoming and previous OPD appointments.
            </p>

          </div>

          <button
            onClick={() => navigate('/patient/hospital')}
            className="bg-[#155ead] text-white font-semibold text-[13px] px-[18px] py-[11px] rounded-[9px] cursor-pointer hover:opacity-90"
          >
            + Book New OPD
          </button>

        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[40px] text-center">

            <p className="text-[#526176] text-[14px]">
              Loading your appointments...
            </p>

          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-[#f3c3c7] rounded-[14px] p-[28px] text-center">

            <p className="text-[#c53a45] text-[14px]">
              {error}
            </p>

          </div>
        )}

        {/* Empty state */}
        {!loading &&
          !error &&
          appointments.length === 0 && (
            <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[48px] text-center shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)]">

              <div className="w-[54px] h-[54px] mx-auto rounded-[12px] bg-[#eaf3ff] flex items-center justify-center text-[#155ead] text-[24px] font-bold">
                A
              </div>

              <h2 className="font-bold text-[#142033] text-[18px] mt-[16px]">
                No appointments yet
              </h2>

              <p className="text-[#7b899c] text-[13px] mt-[6px]">
                You haven't booked any OPD appointments with this
                mobile number yet.
              </p>

              <button
                onClick={() => navigate('/patient/hospital')}
                className="bg-[#155ead] text-white font-semibold text-[13px] px-[20px] py-[11px] rounded-[9px] mt-[20px] cursor-pointer"
              >
                Book Your First OPD →
              </button>

            </div>
          )}

        {/* Appointment List */}
        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div className="flex flex-col gap-[14px]">

              {appointments.map((appointment) => (

                <div
                  key={appointment.id}
                  className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] sm:p-[24px] shadow-[0px_3px_14px_0px_rgba(19,36,58,0.04)]"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[20px]">

                    {/* Left */}
                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-[8px]">

                        <span className="font-bold text-[#142033] text-[17px]">
                          {appointment.doctor?.name ||
                            'Doctor'}
                        </span>

                        <span
                          className={`px-[9px] py-[4px] rounded-full text-[10px] font-semibold ${getStatusClass(
                            appointment.status
                          )}`}
                        >
                          {getStatusLabel(
                            appointment.status
                          )}
                        </span>

                      </div>

                      <p className="text-[#526176] text-[13px] mt-[5px]">
                        {appointment.doctor?.specialization ||
                          appointment.doctor?.department?.name ||
                          'OPD Consultation'}
                      </p>

                      <p className="text-[#7b899c] text-[12px] mt-[3px]">
                        {appointment.hospital?.name ||
                          'HospitalFlow Hospital'}
                      </p>

                    </div>

                    {/* Token */}
                    <div className="min-w-[110px]">

                      <p className="text-[#7b899c] text-[10px] uppercase font-semibold">
                        Token
                      </p>

                      <p className="font-bold text-[#155ead] text-[22px] mt-[2px]">
                        {appointment.tokenNumber || '-'}
                      </p>

                    </div>

                    {/* Date */}
                    <div className="min-w-[125px]">

                      <p className="text-[#7b899c] text-[10px] uppercase font-semibold">
                        Date
                      </p>

                      <p className="font-semibold text-[#142033] text-[13px] mt-[3px]">
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </p>

                    </div>

                    {/* Time */}
                    <div className="min-w-[100px]">

                      <p className="text-[#7b899c] text-[10px] uppercase font-semibold">
                        Time
                      </p>

                      <p className="font-semibold text-[#142033] text-[13px] mt-[3px]">
                        {appointment.appointmentTime || '-'}
                      </p>

                    </div>

                    {/* View */}
                    <button
                      onClick={() =>
                        handleAppointmentClick(
                          appointment.id
                        )
                      }
                      className="border border-[#155ead] text-[#155ead] font-semibold text-[12px] px-[16px] py-[9px] rounded-[8px] cursor-pointer hover:bg-[#eaf3ff]"
                    >
                      View
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}

      </main>

    </div>
  );
}