import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import Button from '../../components/Button';
import {
  hasMinimumLength,
  isTenDigitPhone,
} from '../../utils/validation';

export default function PatientEntryPage() {
  const navigate = useNavigate();

  const {
    setPatientIdentity,
    patientAge,
    setPatientAge,
    reasonForVisit,
    setReasonForVisit,
  } = usePatient();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [age, setAge] = useState(
    patientAge !== null ? String(patientAge) : ''
  );

  const [reason, setReason] = useState(
    reasonForVisit || ''
  );

  const [errors, setErrors] = useState<{
    name?: string;
    age?: string;
    phone?: string;
    reason?: string;
  }>({});

  const validateField = (
    field: 'name' | 'age' | 'phone' | 'reason',
    value: string
  ) => {
    if (field === 'name') {
      return !value.trim()
        ? 'Full name is required'
        : !hasMinimumLength(value, 2)
          ? 'Full name must be at least 2 characters'
          : '';
    }

    if (field === 'age') {
      if (!value.trim()) {
        return 'Age is required';
      }

      const numericAge = Number(value);

      if (
        !Number.isInteger(numericAge) ||
        numericAge < 1 ||
        numericAge > 120
      ) {
        return 'Age must be between 1 and 120';
      }

      return '';
    }

    if (field === 'phone') {
      return !value.trim()
        ? 'Mobile number is required'
        : !isTenDigitPhone(value)
          ? 'Mobile number must be exactly 10 digits'
          : '';
    }

    return !value.trim()
      ? 'Please enter your reason for visit'
      : value.trim().length < 3
        ? 'Reason for visit must be at least 3 characters'
        : '';
  };

  const handleContinue = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const errs = {
      name: validateField('name', name),
      age: validateField('age', age),
      phone: validateField('phone', phone),
      reason: validateField('reason', reason),
    };

    if (
      errs.name ||
      errs.age ||
      errs.phone ||
      errs.reason
    ) {
      setErrors(errs);
      return;
    }

    const numericAge = Number(age);

    setPatientIdentity(
      name.trim(),
      phone.trim()
    );

    setPatientAge(numericAge);

    setReasonForVisit(
      reason.trim()
    );

    navigate('/patient/hospital');
  };

  const inputBase =
    'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[15px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

  return (
    <div className="patient-entry-page min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}

      <div className="bg-white border-b border-[#d8e1ec]">

        <div className="max-w-[1100px] mx-auto px-[24px] h-[60px] flex items-center justify-between">

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[32px] w-auto object-contain"
          />

          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
          >
            Staff Login →
          </button>

        </div>

      </div>

      <div className="flex-1 flex items-center justify-center px-[24px] py-[48px]">

        <div className="w-full max-w-[480px]">

          {/* Hero */}

          <div className="text-center mb-[36px]">

            <div className="flex justify-center mb-[20px]">

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-[72px] w-auto object-contain"
              />

            </div>

            <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[8px]">
              Book Your OPD Appointment
            </h1>

            <p className="font-normal text-[#526176] text-[14px]">
              Search hospitals, choose your doctor, and get your token — all in one place.
            </p>

          </div>

          {/* Form */}

          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <p className="font-bold text-[#142033] text-[16px] mb-[20px]">
              Enter your details
            </p>

            <form
              onSubmit={handleContinue}
              className="flex flex-col gap-[16px]"
            >

              {/* Full Name */}

              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-name"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Full Name{' '}
                  <span className="text-[#c53a45]">
                    *
                  </span>
                </label>

                <input
                  id="patient-name"
                  value={name}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setName(value);

                    setErrors((err) => ({
                      ...err,
                      name: validateField(
                        'name',
                        value
                      ),
                    }));
                  }}
                  onBlur={() =>
                    setErrors((err) => ({
                      ...err,
                      name: validateField(
                        'name',
                        name
                      ),
                    }))
                  }
                  aria-invalid={Boolean(
                    errors.name
                  )}
                  aria-describedby={
                    errors.name
                      ? 'patient-name-error'
                      : undefined
                  }
                  placeholder="e.g. Aarav Patel"
                  className={inputBase}
                />

                {errors.name && (
                  <p
                    id="patient-name-error"
                    className="text-[#c53a45] text-[12px]"
                  >
                    {errors.name}
                  </p>
                )}

              </div>

              {/* Age */}

              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-age"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Age{' '}
                  <span className="text-[#c53a45]">
                    *
                  </span>
                </label>

                <input
                  id="patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setAge(value);

                    setErrors((err) => ({
                      ...err,
                      age: validateField(
                        'age',
                        value
                      ),
                    }));
                  }}
                  onBlur={() =>
                    setErrors((err) => ({
                      ...err,
                      age: validateField(
                        'age',
                        age
                      ),
                    }))
                  }
                  aria-invalid={Boolean(
                    errors.age
                  )}
                  aria-describedby={
                    errors.age
                      ? 'patient-age-error'
                      : undefined
                  }
                  placeholder="e.g. 21"
                  className={inputBase}
                />

                {errors.age && (
                  <p
                    id="patient-age-error"
                    className="text-[#c53a45] text-[12px]"
                  >
                    {errors.age}
                  </p>
                )}

              </div>

              {/* Mobile Number */}

              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-phone"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Mobile Number{' '}
                  <span className="text-[#c53a45]">
                    *
                  </span>
                </label>

                <input
                  id="patient-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setPhone(value);

                    setErrors((err) => ({
                      ...err,
                      phone: validateField(
                        'phone',
                        value
                      ),
                    }));
                  }}
                  onBlur={() =>
                    setErrors((err) => ({
                      ...err,
                      phone: validateField(
                        'phone',
                        phone
                      ),
                    }))
                  }
                  aria-invalid={Boolean(
                    errors.phone
                  )}
                  aria-describedby={
                    errors.phone
                      ? 'patient-phone-error'
                      : undefined
                  }
                  placeholder="+91 98765 XXXXX"
                  className={inputBase}
                />

                {errors.phone && (
                  <p
                    id="patient-phone-error"
                    className="text-[#c53a45] text-[12px]"
                  >
                    {errors.phone}
                  </p>
                )}

              </div>

              {/* Reason for Visit */}

              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="reason-for-visit"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Reason for Visit{' '}
                  <span className="text-[#c53a45]">
                    *
                  </span>
                </label>

                <textarea
                  id="reason-for-visit"
                  value={reason}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    setReason(value);

                    setErrors((err) => ({
                      ...err,
                      reason: validateField(
                        'reason',
                        value
                      ),
                    }));
                  }}
                  onBlur={() =>
                    setErrors((err) => ({
                      ...err,
                      reason: validateField(
                        'reason',
                        reason
                      ),
                    }))
                  }
                  aria-invalid={Boolean(
                    errors.reason
                  )}
                  aria-describedby={
                    errors.reason
                      ? 'reason-for-visit-error'
                      : undefined
                  }
                  placeholder="e.g. Fever, headache, stomach pain..."
                  rows={4}
                  className={`${inputBase} resize-none`}
                />

                <p className="text-[#7b899c] text-[11px]">
                  Briefly describe the problem you are visiting for.
                </p>

                {errors.reason && (
                  <p
                    id="reason-for-visit-error"
                    className="text-[#c53a45] text-[12px]"
                  >
                    {errors.reason}
                  </p>
                )}

              </div>

              {/* Continue */}

              <Button
                variant="primary"
                type="submit"
                className="w-full justify-center py-[12px] mt-[4px]"
              >
                Search Hospitals →
              </Button>

            </form>

          </div>

          {/* Feature pills */}

          <div className="flex gap-[10px] mt-[24px] justify-center flex-wrap">

            {[
              'No registration needed',
              'Instant token',
              'Live queue tracking',
            ].map((f) => (

              <div
                key={f}
                className="bg-white border border-[#d8e1ec] px-[12px] py-[6px] rounded-[999px] flex items-center gap-[6px]"
              >

                <div className="size-[6px] rounded-full bg-[#18865b]" />

                <p className="font-medium text-[#526176] text-[12px]">
                  {f}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
}