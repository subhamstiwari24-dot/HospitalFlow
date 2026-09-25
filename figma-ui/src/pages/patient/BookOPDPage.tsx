import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { usePatient } from '../../context/PatientContext';
import { opdSlots } from '../../data/mockData';
import { ErrorState } from '../../components/EmptyState';
import { hasMinimumLength, isTenDigitPhone } from '../../utils/validation';

const DATES = [
  'Thu, 24 Sep 2026',
  'Fri, 25 Sep 2026',
  'Sat, 26 Sep 2026',
  'Mon, 28 Sep 2026',
  'Tue, 29 Sep 2026',
];

export default function BookOPDPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    selectedDepartment,
    selectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    patientName,
    patientPhone,
    confirmBooking,
  } = usePatient();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!selectedHospital || !selectedDepartment || !selectedDoctor) {
    navigate('/patient/hospital');
    return null;
  }

  const handleBook = async () => {
    if (!selectedSlot || submitting) return;

    if (!hasMinimumLength(patientName, 2)) {
      setError('Full name must be at least 2 characters.');
      return;
    }

    if (!isTenDigitPhone(patientPhone)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      console.log('Creating HospitalFlow appointment...');

      const booking = await confirmBooking();

      console.log(
        'Appointment successfully created:',
        booking
      );

      navigate('/patient/confirmation');
    } catch (err) {
      console.error('Booking failed:', err);

      const message =
        err instanceof Error
          ? err.message
          : 'Unable to create appointment. Please try again.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PatientLayout
      step={3}
      backTo="/patient/doctor"
      maxWidth="max-w-[860px]"
    >
      <div className="mb-[24px]">
        <h1 className="font-bold text-[#142033] text-[24px]">
          Book OPD Appointment
        </h1>

        <p className="font-normal text-[#526176] text-[14px] mt-[4px]">
          Review your selections and choose a time slot.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">

        {/* LEFT */}
        <div className="flex-1 min-w-0 flex flex-col gap-[16px]">

          {/* Booking Summary */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[16px] pb-[14px] border-b border-[#d8e1ec]">
              <div className="bg-[#18865b] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Booking Summary
              </p>
            </div>

            <div className="flex flex-col gap-[12px]">

              {[
                {
                  label: 'Patient',
                  value: patientName || 'Not entered',
                },
                {
                  label: 'Hospital',
                  value: selectedHospital.name,
                },
                {
                  label: 'Department',
                  value: selectedDepartment,
                },
                {
                  label: 'Doctor',
                  value: selectedDoctor.name,
                },
                {
                  label: 'Specialization',
                  value: selectedDoctor.specialization,
                },
                {
                  label: 'Room',
                  value:
                    selectedDoctor.room ||
                    'Room not assigned',
                },
                {
                  label: 'Consultation Fee',
                  value: `₹${selectedDoctor.fee}`,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-[16px]"
                >
                  <p className="font-normal text-[#7b899c] text-[13px] shrink-0">
                    {row.label}
                  </p>

                  <p className="font-semibold text-[#142033] text-[13px] text-right">
                    {row.value}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between gap-[16px]">
                <p className="font-normal text-[#7b899c] text-[13px]">
                  Doctor Status
                </p>

                <StatusBadge status={selectedDoctor.status} />
              </div>

            </div>
          </div>

          {/* Date */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[14px]">
              <div className="bg-[#2475d0] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Select Date
              </p>
            </div>

            <div className="flex gap-[8px] flex-wrap">
              {DATES.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  disabled={submitting}
                  className={`px-[14px] py-[9px] rounded-[10px] text-[12px] font-semibold border transition-colors ${
                    selectedDate === d
                      ? 'bg-[#155ead] text-white border-[#155ead]'
                      : 'bg-white border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]'
                  } ${
                    submitting
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <div className="flex items-center gap-[8px] mb-[14px]">
              <div className="bg-[#6750a4] h-[20px] rounded-[2px] w-[4px]" />

              <p className="font-bold text-[#142033] text-[15px]">
                Select Time Slot
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-[8px]">

              {opdSlots.map((slot) => {
                const isSelected =
                  selectedSlot === slot.time;

                return (
                  <button
                    key={slot.time}
                    onClick={() =>
                      slot.available &&
                      !submitting &&
                      setSelectedSlot(slot.time)
                    }
                    disabled={
                      !slot.available || submitting
                    }
                    className={`rounded-[10px] p-[10px] text-center border transition-colors ${
                      !slot.available
                        ? 'bg-[#f4f7fb] border-[#f4f7fb] opacity-50 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#155ead] border-[#155ead] text-white'
                        : 'bg-white border-[#d8e1ec] hover:border-[#afc0d3] cursor-pointer'
                    }`}
                  >
                    <p
                      className={`font-bold text-[12px] ${
                        isSelected
                          ? 'text-white'
                          : slot.available
                          ? 'text-[#142033]'
                          : 'text-[#afc0d3]'
                      }`}
                    >
                      {slot.time}
                    </p>

                    {slot.available && (
                      <p
                        className={`font-normal text-[10px] mt-[2px] ${
                          isSelected
                            ? 'text-[rgba(255,255,255,0.8)]'
                            : 'text-[#7b899c]'
                        }`}
                      >
                        {slot.remaining} left
                      </p>
                    )}

                    {!slot.available && (
                      <p className="font-normal text-[#afc0d3] text-[10px] mt-[2px]">
                        Full
                      </p>
                    )}
                  </button>
                );
              })}

            </div>

            {!selectedSlot && (
              <p className="font-normal text-[#a86508] text-[12px] mt-[10px]">
                Please select a time slot to continue.
              </p>
            )}
          </div>

        </div>

        {/* RIGHT */}
        <div className="w-full lg:w-[240px] lg:shrink-0 flex flex-col gap-[14px]">

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]">

            <p className="font-bold text-[#142033] text-[14px] mb-[12px]">
              Today's Queue
            </p>

            <div className="flex flex-col gap-[6px]">

              {[
                {
                  label: 'Patients today',
                  value: selectedDoctor.patientsToday,
                },
                {
                  label: 'Currently waiting',
                  value: selectedDoctor.queueLength,
                },
                {
                  label: 'Est. wait',
                  value: `~${selectedDoctor.queueLength * 12} min`,
                },
                {
                  label: 'Next slot',
                  value: selectedDoctor.nextSlot,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-[5px] border-b border-[#f4f7fb] last:border-0"
                >
                  <p className="font-normal text-[#526176] text-[12px]">
                    {row.label}
                  </p>

                  <p className="font-bold text-[#142033] text-[12px]">
                    {row.value}
                  </p>
                </div>
              ))}

            </div>
          </div>

          <div className="bg-[#eaf3fd] border border-[#c3d9f7] rounded-[12px] p-[14px]">

            <p className="font-bold text-[#155ead] text-[12px] mb-[4px]">
              💡 How it works
            </p>

            <p className="font-normal text-[#526176] text-[12px] leading-relaxed">
              After booking, you'll receive a real token number.
              Track your position in the live queue and visit when
              it's your turn.
            </p>

          </div>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-[18px]">
          <ErrorState
            compact
            title="Booking could not be completed"
            description={error}
            onRetry={handleBook}
            retryLabel="Retry booking"
          />
        </div>
      )}

      {/* BOOK BUTTON */}
      <div className="mt-[24px] flex items-center gap-[12px] flex-wrap">

        <Button
          variant="primary"
          onClick={handleBook}
          disabled={!selectedSlot || submitting}
          loading={submitting}
          className="px-[32px] py-[13px] text-[15px]"
        >
          {submitting
            ? 'Creating Appointment...'
            : 'Confirm Booking'}
        </Button>

        <div className="text-[#526176] text-[13px]">

          {selectedSlot ? (
            <span>
              Slot:{' '}
              <span className="font-semibold text-[#142033]">
                {selectedSlot}
              </span>{' '}
              on{' '}
              <span className="font-semibold text-[#142033]">
                {selectedDate}
              </span>
            </span>
          ) : (
            'Select a slot to book'
          )}

        </div>
      </div>

    </PatientLayout>
  );
}