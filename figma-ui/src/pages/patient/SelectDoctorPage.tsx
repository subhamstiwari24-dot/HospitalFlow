import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkDoctorSelect } from '../../components/Skeleton';
import EmptyState, { EmptyIcons, ErrorState } from '../../components/EmptyState';


// =====================================================
// BACKEND TYPES
// =====================================================

type BackendDoctor = {
  id: number;
  name: string;
  specialization: string;
  qualification?: string;
  experience?: string | number;
  status?: string;
  consultationTime?: string | number;

  hospital?: {
    id: number;
    name?: string;
  };

  department?: {
    id: number;
    name: string;
  };
};

type BackendAppointment = {
  id: number;

  doctor?: {
    id: number;
  };

  appointmentDate: string;
  status: string;
};


// =====================================================
// FRONTEND DOCTOR VIEW
// =====================================================

type DoctorView = {
  id: string;
  name: string;
  specialization: string;
  department: string;
  status: string;
  room: string;
  experience: string;
  fee: number;
  queueLength: number;
  rating: number;
  patientsToday: number;
  nextSlot: string;
};


// =====================================================
// QUEUE INDICATOR
// =====================================================

function QueueIndicator({ length }: { length: number }) {
  const color =
    length <= 2
      ? 'text-[#18865b]'
      : length <= 5
        ? 'text-[#a86508]'
        : 'text-[#c53a45]';

  const label =
    length === 0
      ? 'No wait'
      : `${length} ahead`;

  return (
    <p className={`font-semibold text-[12px] ${color}`}>
      {label}
    </p>
  );
}


// =====================================================
// NORMALIZE DOCTOR STATUS
// =====================================================

function normalizeStatus(status?: string): string {
  if (!status) {
    return 'Unavailable';
  }

  const value = status.toLowerCase().trim();

  if (value === 'available') {
    return 'Available';
  }

  if (value === 'busy') {
    return 'Busy';
  }

  if (value === 'delayed') {
    return 'Delayed';
  }

  if (value === 'on break') {
    return 'On Break';
  }

  if (value === 'offline') {
    return 'Offline';
  }

  if (value === 'unavailable') {
    return 'Unavailable';
  }

  return status;
}


// =====================================================
// DATE CONVERTER
// =====================================================

function convertDateToBackendFormat(date: string): string {
  const parsed = new Date(date);

  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const match = date.match(
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i
  );

  if (!match) {
    return date;
  }

  const months: Record<string, string> = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  };

  const day = match[1].padStart(2, '0');
  const month = months[match[2].slice(0, 3)];
  const year = match[3];

  return `${year}-${month}-${day}`;
}


// =====================================================
// MAIN PAGE
// =====================================================

export default function SelectDoctorPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    selectedDepartmentId,
    selectedDoctor,
    setSelectedDoctor,
    setSelectedSlot,
    selectedDate,
  } = usePatient();

  const loading = usePageLoad(500);

  const [backendDoctors, setBackendDoctors] =
    useState<BackendDoctor[]>([]);

  const [appointments, setAppointments] =
    useState<BackendAppointment[]>([]);

  const [loadingDoctors, setLoadingDoctors] =
    useState(true);

  const [error, setError] = useState('');

  const [retryKey, setRetryKey] = useState(0);

  const API_URL = '/api';


  // ===================================================
  // CHECK PREVIOUS STEPS
  // ===================================================

  useEffect(() => {
    if (!selectedHospital || !selectedDepartment) {
      navigate('/patient/hospital', {
        replace: true,
      });
    }
  }, [
    selectedHospital,
    selectedDepartment,
    navigate,
  ]);


  // ===================================================
  // LOAD DOCTORS + APPOINTMENTS
  // ===================================================

  useEffect(() => {
    if (!selectedHospital || !selectedDepartment) {
      return;
    }

    const loadData = async () => {
      try {
        setLoadingDoctors(true);
        setError('');

        const [
          doctorResponse,
          appointmentResponse,
        ] = await Promise.all([
          fetch(`${API_URL}/doctors`),
          fetch(`${API_URL}/appointments`),
        ]);

        if (!doctorResponse.ok) {
          throw new Error(
            'Unable to load doctors'
          );
        }

        if (!appointmentResponse.ok) {
          throw new Error(
            'Unable to load appointments'
          );
        }

        const doctorsData: BackendDoctor[] =
          await doctorResponse.json();

        const appointmentsData: BackendAppointment[] =
          await appointmentResponse.json();

        console.log(
          'HospitalFlow doctors:',
          doctorsData
        );

        console.log(
          'Selected hospital:',
          selectedHospital
        );

        console.log(
          'Selected department:',
          selectedDepartment
        );

        setBackendDoctors(doctorsData);
        setAppointments(appointmentsData);

      } catch (err) {
        console.error(
          'Doctor loading error:',
          err
        );

        setError(
          'Unable to load doctors from HospitalFlow backend.'
        );

        setBackendDoctors([]);
        setAppointments([]);

      } finally {
        setLoadingDoctors(false);
      }
    };

    loadData();

  }, [
    selectedHospital,
    selectedDepartment,
    retryKey,
  ]);


  // ===================================================
  // CONVERT BACKEND DOCTORS
  // ===================================================

  const doctors = useMemo<DoctorView[]>(() => {

    if (
      !selectedHospital ||
      !selectedDepartment
    ) {
      return [];
    }


    // =================================================
    // IMPORTANT FIX
    //
    // BEFORE:
    // doctor.specialization === selectedDepartment
    //
    // NOW:
    // doctor.department.name === selectedDepartment
    //
    // Because specialization and department are
    // different backend fields.
    // =================================================

    const hospitalDoctors =
      backendDoctors.filter((doctor) => {

        const sameHospital =
          Number(doctor.hospital?.id) ===
          Number(selectedHospital.id);

        const sameDepartment =
          Number(doctor.department?.id) ===
          Number(selectedDepartmentId);

        console.log(
          'Doctor filter:',
          {
            doctor: doctor.name,
            doctorHospital:
              doctor.hospital?.id,
            selectedHospital:
              selectedHospital.id,
            doctorDepartment:
              doctor.department?.name,
            selectedDepartment,
            sameHospital,
            sameDepartment,
          }
        );

        return (
          sameHospital &&
          sameDepartment
        );
      });


    // =================================================
    // CREATE FRONTEND DOCTOR OBJECTS
    // =================================================

    return hospitalDoctors.map((doctor) => {

      const doctorAppointments =
        appointments.filter(
          (appointment) =>
            appointment.doctor?.id ===
            doctor.id
        );


      const waitingAppointments =
        doctorAppointments.filter(
          (appointment) =>
            appointment.status
              ?.toUpperCase() ===
            'WAITING'
        );


      return {
        id: String(doctor.id),

        name: doctor.name,

        specialization:
          doctor.specialization,

        department:
          doctor.department?.name ??
          selectedDepartment,

        status:
          normalizeStatus(
            doctor.status
          ),

        room:
          'Room not assigned',

        experience:
          doctor.experience !== undefined
            ? `${doctor.experience} years experience`
            : 'Experience not specified',

        fee: 0,

        queueLength:
          waitingAppointments.length,

        rating: 0,

        patientsToday:
          doctorAppointments.length,

        nextSlot:
          'Slot selection next',
      };
    });

  }, [
    backendDoctors,
    appointments,
    selectedHospital,
    selectedDepartment,
    selectedDepartmentId,
  ]);


  // ===================================================
  // SELECT DOCTOR
  // ===================================================

  const handleSelect = (
    doctor: DoctorView
  ) => {
    setSelectedDoctor(doctor);
    setSelectedSlot(null);
  };


  // ===================================================
  // ESTIMATED WAIT
  // ===================================================

  const getEstimatedWait = (
    doctor: DoctorView
  ) => {

    if (doctor.queueLength === 0) {
      return 0;
    }

    return doctor.queueLength * 10;
  };


  // ===================================================
  // SAFETY
  // ===================================================

  if (
    !selectedHospital ||
    !selectedDepartment
  ) {
    return null;
  }


  // ===================================================
  // SKELETON
  // ===================================================

  if (loading) {
    return (
      <PatientLayout
        step={2}
        backTo="/patient/department"
        maxWidth="max-w-[860px]"
      >
        <SkDoctorSelect />
      </PatientLayout>
    );
  }


  // ===================================================
  // UI
  // ===================================================

  return (
    <PatientLayout
      step={2}
      backTo="/patient/department"
      maxWidth="max-w-[860px]"
    >

      {/* ============================================= */}
      {/* HEADER */}
      {/* ============================================= */}

      <div className="mb-[24px]">

        <div className="flex items-center gap-[8px] flex-wrap mb-[6px]">

          <p className="font-normal text-[#7b899c] text-[13px]">
            {selectedHospital.name}
          </p>

          <span className="text-[#d8e1ec]">
            ›
          </span>

          <p className="font-normal text-[#7b899c] text-[13px]">
            {selectedDepartment}
          </p>

          <span className="text-[#d8e1ec]">
            ›
          </span>

          <p className="font-semibold text-[#142033] text-[13px]">
            Select Doctor
          </p>

        </div>


        <h1 className="font-bold text-[#142033] text-[24px]">
          Choose Your Doctor
        </h1>


        <p className="font-normal text-[#526176] text-[14px] mt-[4px]">

          {doctors.length} doctor
          {doctors.length !== 1
            ? 's'
            : ''}{' '}

          available in{' '}

          {selectedDepartment}

        </p>

      </div>


      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {error && !loadingDoctors && (
        <ErrorState
          description={error}
          onRetry={() =>
            setRetryKey(
              (key) => key + 1
            )
          }
        />
      )}


      {/* ============================================= */}
      {/* LOADING */}
      {/* ============================================= */}

      {loadingDoctors && (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] text-center mb-[28px]">

          <p className="text-[#526176] text-[14px]">
            Loading doctors from HospitalFlow...
          </p>

        </div>
      )}


      {/* ============================================= */}
      {/* DOCTORS */}
      {/* ============================================= */}

      {!loadingDoctors &&
        !error && (
          <div className="flex flex-col gap-[12px] mb-[28px]">

            {doctors.map((doctor) => {

              const isSelected =
                selectedDoctor?.id ===
                doctor.id;

              const waitMins =
                getEstimatedWait(
                  doctor
                );


              return (
                <div
                  key={doctor.id}
                  onClick={() =>
                    handleSelect(
                      doctor
                    )
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key ===
                        'Enter' ||
                      event.key === ' '
                    ) {

                      event.preventDefault();

                      handleSelect(
                        doctor
                      );
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`bg-white border rounded-[14px] p-[20px] cursor-pointer transition-[border-color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-[#2475d0] focus-visible:outline-offset-2 active:translate-y-px ${
                    isSelected
                      ? 'border-[#155ead] shadow-[0px_0px_0px_3px_rgba(21,94,173,0.12)]'
                      : 'border-[#d8e1ec] hover:border-[#afc0d3] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
                  }`}
                >

                  <div className="flex gap-[16px] items-start">


                    {/* ================================= */}
                    {/* AVATAR */}
                    {/* ================================= */}

                    <div
                      className={`size-[52px] rounded-[14px] flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#eaf3fd]'
                          : 'bg-[#f4f7fb]'
                      }`}
                    >

                      <p
                        className={`font-bold text-[16px] ${
                          isSelected
                            ? 'text-[#155ead]'
                            : 'text-[#526176]'
                        }`}
                      >

                        {doctor.name
                          .replace(
                            /^Dr\.\s*/i,
                            ''
                          )
                          .split(' ')
                          .map(
                            (word) =>
                              word[0]
                          )
                          .join('')
                          .slice(0, 2)}

                      </p>

                    </div>


                    {/* ================================= */}
                    {/* INFO */}
                    {/* ================================= */}

                    <div className="flex-1 min-w-0">

                      <div className="flex items-center gap-[10px] flex-wrap mb-[3px]">

                        <p className="font-bold text-[#142033] text-[16px]">
                          {doctor.name}
                        </p>

                        <StatusBadge
                          status={
                            doctor.status
                          }
                        />

                      </div>


                      <p className="font-normal text-[#526176] text-[13px] mb-[10px]">
                        {doctor.specialization}
                      </p>


                      <div className="flex items-center gap-[18px] flex-wrap">

                        <div className="flex items-center gap-[6px]">

                          <span className="text-[#7b899c] text-[12px]">
                            🎓
                          </span>

                          <p className="font-normal text-[#526176] text-[12px]">
                            {doctor.experience}
                          </p>

                        </div>


                        <div className="flex items-center gap-[6px]">

                          <span className="text-[#7b899c] text-[12px]">
                            👥
                          </span>

                          <p className="font-normal text-[#526176] text-[12px]">
                            {doctor.patientsToday}{' '}
                            appointments
                          </p>

                        </div>


                        <div className="flex items-center gap-[6px]">

                          <span className="text-[#7b899c] text-[12px]">
                            ⏳
                          </span>

                          <QueueIndicator
                            length={
                              doctor.queueLength
                            }
                          />

                        </div>


                        <div className="flex items-center gap-[6px]">

                          <span className="text-[#7b899c] text-[12px]">
                            🕐
                          </span>

                          <p className="font-normal text-[#526176] text-[12px]">

                            {waitMins === 0
                              ? 'No current wait'
                              : `~${waitMins} min estimated`}

                          </p>

                        </div>

                      </div>


                      {/* ================================= */}
                      {/* BACKEND INFORMATION */}
                      {/* ================================= */}

                      <div className="flex gap-[6px] mt-[12px] flex-wrap">

                        {doctor.room !==
                          'Room not assigned' && (
                          <span className="bg-[#f4f7fb] text-[#526176] text-[11px] font-medium px-[8px] py-[3px] rounded-[6px]">
                            {doctor.room}
                          </span>
                        )}

                        <span className="bg-[#e8f7f1] text-[#18865b] text-[11px] font-semibold px-[8px] py-[3px] rounded-[6px]">
                          HospitalFlow Connected
                        </span>

                      </div>

                    </div>


                    {/* ================================= */}
                    {/* SELECTOR */}
                    {/* ================================= */}

                    <div className="flex flex-col items-end gap-[10px] shrink-0">

                      <div
                        className={`size-[22px] rounded-[999px] border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-[#155ead] bg-[#155ead]'
                            : 'border-[#d8e1ec]'
                        }`}
                      >

                        {isSelected && (
                          <span className="text-white text-[11px] font-bold">
                            ✓
                          </span>
                        )}

                      </div>


                      <div className="text-right">

                        <p className="font-semibold text-[#526176] text-[12px]">
                          Consultation fee
                        </p>

                        <p className="font-normal text-[#7b899c] text-[10px]">
                          Not specified
                        </p>

                      </div>


                      <div className="bg-[#eaf3fd] px-[8px] py-[3px] rounded-[6px]">

                        <p className="font-semibold text-[#155ead] text-[11px]">
                          Next: Select slot
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}


            {/* ========================================= */}
            {/* EMPTY STATE */}
            {/* ========================================= */}

            {doctors.length === 0 &&
              !error && (
                <EmptyState
                  icon={EmptyIcons.stethoscope(28)}
                  title="No doctors available"
                  description={`There are no doctors assigned to ${selectedDepartment} at ${selectedHospital.name}.`}
                />
              )}

          </div>
        )}


      {/* ============================================= */}
      {/* CTA */}
      {/* ============================================= */}

      <Button
        variant="primary"
        onClick={() =>
          navigate('/patient/book')
        }
        disabled={!selectedDoctor}
        className="px-[28px] py-[12px] text-[14px]"
      >
        Book OPD Appointment →
      </Button>

    </PatientLayout>
  );
}