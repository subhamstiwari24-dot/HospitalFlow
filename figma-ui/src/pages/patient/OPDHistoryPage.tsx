import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PatientSession {
  patientId?: number;
  fullName: string;
  phone: string;
  email?: string;
}

interface Appointment {
  id: number;
  patientName: string;
  patientPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  tokenNumber: string;
  status: string;
  priority: string;
  doctor?: {
    name?: string;
    specialization?: string;
    department?: {
      name?: string;
    };
  };
  hospital?: {
    name?: string;
    address?: string;
  };
}

export default function OPDHistoryPage() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedPatient = sessionStorage.getItem(
      'hospitalflow_patient'
    );

    if (!storedPatient) {
      setLoading(false);
      return;
    }

    let patient: PatientSession;

    try {
      patient = JSON.parse(storedPatient);
    } catch {
      setError('Unable to read patient information.');
      setLoading(false);
      return;
    }

    if (!patient.phone) {
      setError('Patient mobile number is missing.');
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/appointments/patient/${encodeURIComponent(
            patient.phone
          )}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch appointment history.');
        }

        const data: Appointment[] = await response.json();

        const completedAppointments = data
          .filter(
            (appointment) =>
              appointment.status?.toUpperCase() === 'COMPLETED'
          )
          .sort((a, b) => {
            const dateA = `${a.appointmentDate} ${a.appointmentTime}`;
            const dateB = `${b.appointmentDate} ${b.appointmentTime}`;

            return dateB.localeCompare(dateA);
          });

        setAppointments(completedAppointments);
      } catch (err) {
        console.error(err);
        setError('Unable to load OPD history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const storedPatient = sessionStorage.getItem(
    'hospitalflow_patient'
  );

  if (!storedPatient) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          padding: '24px',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h2>Login Required</h2>

          <p>
            Please login to view your OPD history.
          </p>

          <button
            onClick={() => navigate('/patient/login')}
            style={{
              marginTop: '16px',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              background: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const patient: PatientSession = JSON.parse(storedPatient);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '32px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >

        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '28px',
            gap: '16px',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '30px',
                fontWeight: 700,
              }}
            >
              OPD History
            </h1>

            <p
              style={{
                marginTop: '8px',
                color: '#64748b',
              }}
            >
              Your completed OPD consultations
            </p>
          </div>

          <button
            onClick={() => navigate('/patient/dashboard')}
            style={{
              padding: '10px 18px',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              background: '#ffffff',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Patient */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: '18px',
            }}
          >
            {patient.fullName}
          </div>

          <div
            style={{
              color: '#64748b',
              marginTop: '5px',
            }}
          >
            {patient.phone}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: '#ffffff',
              padding: '40px',
              borderRadius: '14px',
              textAlign: 'center',
            }}
          >
            Loading OPD history...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: '#ffffff',
              padding: '30px',
              borderRadius: '14px',
              color: '#dc2626',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && appointments.length === 0 && (
          <div
            style={{
              background: '#ffffff',
              padding: '50px 30px',
              borderRadius: '14px',
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <h2>No OPD History Yet</h2>

            <p
              style={{
                color: '#64748b',
              }}
            >
              Your completed consultations will appear here.
            </p>

            <button
              onClick={() => navigate('/patient/hospital')}
              style={{
                marginTop: '16px',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#2563eb',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Book New OPD
            </button>
          </div>
        )}

        {/* History */}
        {!loading &&
          !error &&
          appointments.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    padding: '22px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '20px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: '19px',
                        }}
                      >
                        {appointment.doctor?.name ||
                          'Doctor'}
                      </h3>

                      <p
                        style={{
                          margin: '6px 0 0',
                          color: '#64748b',
                        }}
                      >
                        {appointment.doctor?.specialization ||
                          appointment.doctor?.department?.name ||
                          'OPD Consultation'}
                      </p>
                    </div>

                    <span
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: '#dcfce7',
                        color: '#166534',
                        fontSize: '13px',
                        fontWeight: 600,
                      }}
                    >
                      Completed
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '16px',
                      marginTop: '22px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                        }}
                      >
                        Token
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {appointment.tokenNumber}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                        }}
                      >
                        Date
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {appointment.appointmentDate}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                        }}
                      >
                        Time
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {appointment.appointmentTime}
                      </div>
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '12px',
                          color: '#94a3b8',
                        }}
                      >
                        Hospital
                      </div>

                      <div
                        style={{
                          marginTop: '4px',
                          fontWeight: 600,
                        }}
                      >
                        {appointment.hospital?.name ||
                          'Hospital'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </div>
  );
}