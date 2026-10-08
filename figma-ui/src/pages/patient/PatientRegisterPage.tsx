import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

export default function PatientRegisterPage() {
  const navigate = useNavigate();

  // ============================================================
  // FORM STATES
  // ============================================================

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ============================================================
  // PASSWORD VISIBILITY
  // ============================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // ============================================================
  // ERRORS
  // ============================================================

  const [errors, setErrors] = useState<{
    fullName?: string;
    age?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // ============================================================
  // OTP STATES
  // ============================================================

  const [registrationStep, setRegistrationStep] =
    useState<1 | 2>(1);

  const [otp, setOtp] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ============================================================
  // LOADING
  // ============================================================

  const [isLoading, setIsLoading] = useState(false);

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const nextErrors: typeof errors = {};

    // Full Name
    if (!fullName.trim()) {
      nextErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      nextErrors.fullName =
        'Full name must be at least 2 characters';
    }

    // Age
    if (!age.trim()) {
      nextErrors.age = 'Age is required';
    } else {
      const numericAge = Number(age);

      if (!Number.isInteger(numericAge)) {
        nextErrors.age = 'Age must be a whole number';
      } else if (numericAge < 1) {
        nextErrors.age =
          'Age must be at least 1 year';
      } else if (numericAge > 120) {
        nextErrors.age =
          'Please enter a valid age';
      }
    }

    // Mobile Number
    if (!phone.trim()) {
      nextErrors.phone =
        'Mobile number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      nextErrors.phone =
        'Mobile number must be exactly 10 digits';
    }

    // Email
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      nextErrors.email =
        'Enter a valid email address';
    }

    // Password
    if (!password.trim()) {
      nextErrors.password =
        'Password is required';
    } else if (password.length < 6) {
      nextErrors.password =
        'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword =
        'Please confirm your password';
    } else if (
      password !== confirmPassword
    ) {
      nextErrors.confirmPassword =
        'Passwords do not match';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    setErrors((current) => ({
      ...current,
      general: '',
    }));

    try {
      const response = await fetch(
        '/api/patients/register',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            fullName: fullName.trim(),
            age: Number(age),
            phone: phone.trim(),
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general:
            data?.message ||
            'Registration failed. Please try again.',
        });

        return;
      }

      // Move to OTP verification
      setRegistrationStep(2);
      setErrors({});
    } catch (error) {
      console.error(
        'Patient registration error:',
        error
      );

      setErrors({
        general:
          'Unable to connect to the server. Please make sure the backend is running.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // RESEND OTP
  // ============================================================

  const handleResendRegistrationOtp =
    async () => {
      if (resendCooldown > 0) {
        return;
      }

      setIsLoading(true);
      setResendMessage('');

      try {
        const response = await fetch(
          '/api/patients/register/resend',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              email: email.trim(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setResendMessage(
            data?.message ||
              'Unable to resend OTP'
          );

          return;
        }

        setResendMessage(
          'A new OTP was sent to your email.'
        );

        setResendCooldown(60);

        const timer = window.setInterval(
          () => {
            setResendCooldown(
              (current) => {
                if (current <= 1) {
                  window.clearInterval(
                    timer
                  );

                  return 0;
                }

                return current - 1;
              }
            );
          },
          1000
        );
      } catch {
        setResendMessage(
          'Unable to connect to the server.'
        );
      } finally {
        setIsLoading(false);
      }
    };

  // ============================================================
  // VERIFY OTP
  // ============================================================

  const handleVerifyRegistration = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setErrors({
        general:
          'Enter the 6-digit OTP',
      });

      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        '/api/patients/register/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general:
            data?.message ||
            'Invalid or expired OTP',
        });

        return;
      }

      alert(
        `Account created. Your Patient ID is ${data.patientId}`
      );

      navigate('/patient/login');
    } catch {
      setErrors({
        general:
          'Unable to connect to the server.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[A-Z]/.test(password) &&
              /\d/.test(password) &&
              /[^A-Za-z0-9]/.test(password)
            ? 4
            : 3;

  // ============================================================
  // INPUT STYLES
  // ============================================================

  const inputBase =
    'w-full rounded-[12px] border border-white/10 bg-[#071a31]/80 px-[14px] py-[13px] text-[14px] text-white placeholder:text-[#7890aa] outline-none transition-all duration-200 focus:border-[#16d9e3] focus:ring-2 focus:ring-[#16d9e3]/10';

  const iconInputBase =
    'absolute left-[14px] top-1/2 -translate-y-1/2 text-[#54dce5]';

  const errorInput =
    'border-[#ff6678] focus:border-[#ff6678] focus:ring-[#ff6678]/10';

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="patient-register-page min-h-screen overflow-hidden bg-[#031326] text-white">

      {/* ========================================================
          BACKGROUND GLOW
         ======================================================== */}

      <div className="pointer-events-none fixed inset-0">

        <div className="absolute -left-[180px] -top-[180px] h-[520px] w-[520px] rounded-full bg-[#00d9ff]/10 blur-[110px]" />

        <div className="absolute -bottom-[220px] -right-[180px] h-[620px] w-[620px] rounded-full bg-[#087cff]/10 blur-[130px]" />

        <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00e5d4]/5 blur-[100px]" />

      </div>

      {/* ========================================================
          HEADER
         ======================================================== */}

      <header className="relative z-10 border-b border-white/10 bg-[#031326]/75 backdrop-blur-xl">

        <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-[20px] sm:px-[30px]">

          {/* Logo */}

          <button
            type="button"
            onClick={() =>
              navigate('/patient')
            }
            className="group cursor-pointer"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[34px] w-auto object-contain transition-transform group-hover:scale-[1.03]"
            />
          </button>

          {/* Login */}

          <button
            type="button"
            onClick={() =>
              navigate('/patient/login')
            }
            className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#16d9e3]/30 bg-[#16d9e3]/5 px-[13px] py-[8px] text-[12px] font-semibold text-[#7ceaf0] transition-all hover:border-[#16d9e3]/60 hover:bg-[#16d9e3]/10"
          >
            Already registered?

            <span className="text-white">
              Sign in
            </span>

            <ArrowRight size={14} />

          </button>

        </div>

      </header>

      {/* ========================================================
          MAIN
         ======================================================== */}

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-[1180px] items-center px-[20px] py-[34px] sm:px-[30px] lg:py-[48px]">

        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-[#061a31]/85 shadow-[0_30px_100px_rgba(0,0,0,0.38)] backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">

          {/* ====================================================
              LEFT PREMIUM BRANDING PANEL
             ==================================================== */}

          <section className="relative hidden overflow-hidden border-r border-white/10 bg-gradient-to-br from-[#062849] via-[#05203b] to-[#031326] p-[42px] lg:flex lg:flex-col lg:justify-between">

            {/* Decorative circles */}

            <div className="absolute right-[-80px] top-[-80px] h-[280px] w-[280px] rounded-full border border-[#16d9e3]/10" />

            <div className="absolute bottom-[-100px] left-[-100px] h-[300px] w-[300px] rounded-full border border-[#16d9e3]/10" />

            <div className="relative">

              {/* Icon */}

              <div className="mb-[28px] flex h-[52px] w-[52px] items-center justify-center rounded-[16px] border border-[#16d9e3]/25 bg-[#16d9e3]/10 text-[#4de4ec] shadow-[0_0_35px_rgba(22,217,227,0.12)]">

                <ShieldCheck size={28} />

              </div>

              {/* Brand */}

              <p className="mb-[9px] flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#54dce5]">

                <Sparkles size={14} />

                HospitalFlow

              </p>

              {/* Heading */}

              <h1 className="max-w-[390px] text-[34px] font-bold leading-[1.08] tracking-[-0.02em] text-white">

                Your healthcare,

                <span className="block text-[#3fe0e8]">
                  one flow.
                </span>

              </h1>

              <p className="mt-[18px] max-w-[390px] text-[14px] leading-[1.7] text-[#9bb1c8]">

                Create your patient account and manage appointments,
                digital tokens, OPD queues and hospital visits from
                one secure place.

              </p>

            </div>

            {/* Features */}

            <div className="relative mt-[42px] space-y-[12px]">

              <div className="flex items-center gap-3 rounded-[13px] border border-white/8 bg-white/[0.035] px-[14px] py-[12px]">

                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#24dce5]"
                />

                <span className="text-[13px] text-[#c3d1df]">
                  Real-time OPD queue tracking
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-[13px] border border-white/8 bg-white/[0.035] px-[14px] py-[12px]">

                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#24dce5]"
                />

                <span className="text-[13px] text-[#c3d1df]">
                  Digital appointment tokens
                </span>

              </div>

              <div className="flex items-center gap-3 rounded-[13px] border border-white/8 bg-white/[0.035] px-[14px] py-[12px]">

                <CheckCircle2
                  size={17}
                  className="shrink-0 text-[#24dce5]"
                />

                <span className="text-[13px] text-[#c3d1df]">
                  Secure patient account
                </span>

              </div>

            </div>

            {/* Security */}

            <div className="relative mt-[30px] flex items-center gap-3 border-t border-white/10 pt-[20px]">

              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#16d9e3]/10 text-[#54dce5]">

                <LockKeyhole size={17} />

              </div>

              <div>

                <p className="text-[12px] font-semibold text-white">
                  Secure registration
                </p>

                <p className="text-[11px] text-[#7890aa]">
                  Email verification protects your account.
                </p>

              </div>

            </div>

          </section>

          {/* ====================================================
              RIGHT FORM PANEL
             ==================================================== */}

          <section className="p-[22px] sm:p-[34px] lg:p-[44px]">

            <div className="mx-auto max-w-[520px]">

              {/* Mobile Branding */}

              <div className="mb-[22px] flex items-center gap-3 lg:hidden">

                <div className="flex h-[42px] w-[42px] items-center justify-center rounded-[13px] bg-[#16d9e3]/10 text-[#54dce5]">

                  <ShieldCheck size={23} />

                </div>

                <div>

                  <p className="text-[13px] font-bold text-white">
                    HospitalFlow
                  </p>

                  <p className="text-[11px] text-[#7890aa]">
                    Patient registration
                  </p>

                </div>

              </div>

              {/* Heading */}

              <div className="mb-[24px]">

                <div className="mb-[11px] flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#54dce5]">

                  <span className="h-[6px] w-[6px] rounded-full bg-[#16d9e3] shadow-[0_0_10px_#16d9e3]" />

                  {registrationStep === 1
                    ? 'Create account'
                    : 'Email verification'}

                </div>

                <h2 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-white sm:text-[31px]">

                  {registrationStep === 1
                    ? 'Create your patient account'
                    : 'Verify your email'}

                </h2>

                <p className="mt-[8px] text-[13px] leading-[1.6] text-[#8fa6bd]">

                  {registrationStep === 1
                    ? 'Enter your details to get started with HospitalFlow.'
                    : `Enter the 6-digit verification code sent to ${email}.`}

                </p>

              </div>

              {/* ==================================================
                  STEP INDICATOR
                 ================================================== */}

              <div className="mb-[24px] flex items-center gap-3">

                {/* Step 1 */}

                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    registrationStep === 1
                      ? 'text-[#62e7ed]'
                      : 'text-[#8fa6bd]'
                  }`}
                >

                  <span
                    className={`flex h-[25px] w-[25px] items-center justify-center rounded-full ${
                      registrationStep === 1
                        ? 'bg-[#16d9e3] text-[#031326]'
                        : 'bg-[#16d9e3]/15 text-[#62e7ed]'
                    }`}
                  >

                    {registrationStep === 2 ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      '1'
                    )}

                  </span>

                  Details

                </div>

                <div className="h-px flex-1 bg-white/10" />

                {/* Step 2 */}

                <div
                  className={`flex items-center gap-2 text-[11px] font-semibold ${
                    registrationStep === 2
                      ? 'text-[#62e7ed]'
                      : 'text-[#617992]'
                  }`}
                >

                  <span
                    className={`flex h-[25px] w-[25px] items-center justify-center rounded-full ${
                      registrationStep === 2
                        ? 'bg-[#16d9e3] text-[#031326]'
                        : 'bg-white/5 text-[#7890aa]'
                    }`}
                  >
                    2
                  </span>

                  Verify

                </div>

              </div>

              {/* ==================================================
                  FORM CARD
                 ================================================== */}

              <div className="rounded-[20px] border border-white/10 bg-[#04172b]/70 p-[17px] sm:p-[22px]">

                {/* =================================================
                    STEP 2 — OTP
                   ================================================= */}

                {registrationStep === 2 ? (

                  <form
                    onSubmit={
                      handleVerifyRegistration
                    }
                    className="flex flex-col gap-[16px]"
                  >

                    {/* Error */}

                    {errors.general && (
                      <div className="rounded-[12px] border border-[#ff6678]/25 bg-[#ff6678]/10 px-[13px] py-[11px]">

                        <p className="text-[12px] text-[#ff9aa7]">
                          {errors.general}
                        </p>

                      </div>
                    )}

                    {/* Email info */}

                    <div className="rounded-[14px] border border-[#16d9e3]/15 bg-[#16d9e3]/5 p-[16px]">

                      <div className="flex items-start gap-3">

                        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[11px] bg-[#16d9e3]/10 text-[#54dce5]">

                          <Mail size={19} />

                        </div>

                        <div>

                          <p className="text-[13px] font-semibold text-white">
                            Check your inbox
                          </p>

                          <p className="mt-1 text-[11px] leading-[1.5] text-[#8fa6bd]">

                            We sent a verification code to{' '}

                            <span className="font-semibold text-[#c8f7fa]">
                              {email}
                            </span>

                          </p>

                        </div>

                      </div>

                    </div>

                    {/* OTP */}

                    <div>

                      <label className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]">

                        6-digit verification code

                      </label>

                      <input
                        value={otp}
                        onChange={(e) => {

                          setOtp(
                            e.target.value
                              .replace(
                                /\D/g,
                                ''
                              )
                              .slice(
                                0,
                                6
                              )
                          );

                          setErrors(
                            (current) => ({
                              ...current,
                              general: '',
                            })
                          );

                        }}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        className={`${inputBase} text-center text-[24px] font-bold tracking-[0.45em]`}
                        autoFocus
                      />

                    </div>

                    {/* Resend message */}

                    {resendMessage && (
                      <p className="text-center text-[11px] text-[#54dca5]">
                        {resendMessage}
                      </p>
                    )}

                    {/* Verify button */}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#09b9df] to-[#16d9e3] py-[13px] text-[13px] font-bold text-[#021526] shadow-[0_10px_30px_rgba(22,217,227,0.18)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {isLoading
                        ? 'Verifying...'
                        : 'Verify Email'}

                      {!isLoading && (
                        <ArrowRight size={16} />
                      )}

                    </button>

                    {/* Resend */}

                    <div className="flex flex-col items-center gap-[9px]">

                      <button
                        type="button"
                        onClick={
                          handleResendRegistrationOtp
                        }
                        disabled={
                          isLoading ||
                          resendCooldown > 0
                        }
                        className="cursor-pointer text-[12px] font-semibold text-[#63e4eb] transition-colors hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      >

                        {resendCooldown > 0
                          ? `Resend OTP in ${resendCooldown}s`
                          : 'Resend OTP'}

                      </button>

                      <button
                        type="button"
                        onClick={() => {

                          setRegistrationStep(1);
                          setErrors({});

                        }}
                        className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-[#7890aa] transition-colors hover:text-white"
                      >

                        <ArrowLeft size={13} />

                        Back to registration

                      </button>

                    </div>

                  </form>

                ) : (

                  /* =================================================
                     STEP 1 — REGISTRATION
                     ================================================= */

                  <form
                    onSubmit={handleRegister}
                    className="flex flex-col gap-[14px]"
                  >

                    {/* General Error */}

                    {errors.general && (
                      <div className="rounded-[12px] border border-[#ff6678]/25 bg-[#ff6678]/10 px-[13px] py-[11px]">

                        <p className="text-[12px] text-[#ff9aa7]">
                          {errors.general}
                        </p>

                      </div>
                    )}

                    {/* =================================================
                        FULL NAME + AGE
                       ================================================= */}

                    <div className="grid gap-[14px] sm:grid-cols-[1.5fr_0.7fr]">

                      {/* Full Name */}

                      <div>

                        <label
                          htmlFor="patient-full-name"
                          className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                        >
                          Full Name
                        </label>

                        <div className="relative">

                          <UserRound
                            size={17}
                            className={
                              iconInputBase
                            }
                          />

                          <input
                            id="patient-full-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => {

                              setFullName(
                                e.target.value
                              );

                              setErrors(
                                (current) => ({
                                  ...current,
                                  fullName: '',
                                  general: '',
                                })
                              );

                            }}
                            placeholder="Enter your full name"
                            className={`${inputBase} pl-[43px] ${
                              errors.fullName
                                ? errorInput
                                : ''
                            }`}
                          />

                        </div>

                        {errors.fullName && (
                          <p className="mt-1 text-[11px] text-[#ff8290]">
                            {errors.fullName}
                          </p>
                        )}

                      </div>

                      {/* Age */}

                      <div>

                        <label
                          htmlFor="patient-age"
                          className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                        >
                          Age
                        </label>

                        <input
                          id="patient-age"
                          type="number"
                          min="1"
                          max="120"
                          value={age}
                          onChange={(e) => {

                            setAge(
                              e.target.value
                            );

                            setErrors(
                              (current) => ({
                                ...current,
                                age: '',
                                general: '',
                              })
                            );

                          }}
                          placeholder="Age"
                          className={`${inputBase} ${
                            errors.age
                              ? errorInput
                              : ''
                          }`}
                        />

                        {errors.age && (
                          <p className="mt-1 text-[11px] text-[#ff8290]">
                            {errors.age}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* =================================================
                        PHONE
                       ================================================= */}

                    <div>

                      <label
                        htmlFor="patient-register-phone"
                        className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                      >
                        Mobile Number
                      </label>

                      <div className="relative">

                        <Phone
                          size={17}
                          className={
                            iconInputBase
                          }
                        />

                        <input
                          id="patient-register-phone"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => {

                            const value =
                              e.target.value.replace(
                                /\D/g,
                                ''
                              );

                            setPhone(value);

                            setErrors(
                              (current) => ({
                                ...current,
                                phone:
                                  value.length ===
                                  0
                                    ? 'Mobile number is required'
                                    : value.length !==
                                        10
                                      ? 'Mobile number must be exactly 10 digits'
                                      : '',
                                general: '',
                              })
                            );

                          }}
                          placeholder="98765 43210"
                          className={`${inputBase} pl-[43px] ${
                            errors.phone
                              ? errorInput
                              : ''
                          }`}
                        />

                      </div>

                      {errors.phone && (
                        <p className="mt-1 text-[11px] text-[#ff8290]">
                          {errors.phone}
                        </p>
                      )}

                    </div>

                    {/* =================================================
                        EMAIL
                       ================================================= */}

                    <div>

                      <label
                        htmlFor="patient-email"
                        className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                      >
                        Email Address
                      </label>

                      <div className="relative">

                        <Mail
                          size={17}
                          className={
                            iconInputBase
                          }
                        />

                        <input
                          id="patient-email"
                          type="email"
                          value={email}
                          onChange={(e) => {

                            setEmail(
                              e.target.value
                            );

                            setErrors(
                              (current) => ({
                                ...current,
                                email: '',
                                general: '',
                              })
                            );

                          }}
                          placeholder="you@example.com"
                          className={`${inputBase} pl-[43px] ${
                            errors.email
                              ? errorInput
                              : ''
                          }`}
                        />

                      </div>

                      {errors.email && (
                        <p className="mt-1 text-[11px] text-[#ff8290]">
                          {errors.email}
                        </p>
                      )}

                    </div>

                    {/* =================================================
                        PASSWORD
                       ================================================= */}

                    <div>

                      <label
                        htmlFor="patient-register-password"
                        className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                      >
                        Password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          size={17}
                          className={
                            iconInputBase
                          }
                        />

                        <input
                          id="patient-register-password"
                          type={
                            showPassword
                              ? 'text'
                              : 'password'
                          }
                          value={password}
                          onChange={(e) => {

                            setPassword(
                              e.target.value
                            );

                            setErrors(
                              (current) => ({
                                ...current,
                                password: '',
                                general: '',
                              })
                            );

                          }}
                          placeholder="Create a secure password"
                          className={`${inputBase} pl-[43px] pr-[45px] ${
                            errors.password
                              ? errorInput
                              : ''
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current
                            )
                          }
                          className="absolute right-[13px] top-1/2 -translate-y-1/2 cursor-pointer text-[#7890aa] transition-colors hover:text-[#54dce5]"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >

                          {showPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}

                        </button>

                      </div>

                      {/* Password strength */}

                      {password.length > 0 && (
                        <div className="mt-[8px]">

                          <div className="flex gap-1">

                            {[1, 2, 3, 4].map(
                              (level) => (

                                <div
                                  key={level}
                                  className={`h-[3px] flex-1 rounded-full ${
                                    level <=
                                    passwordStrength
                                      ? 'bg-[#16d9e3]'
                                      : 'bg-white/10'
                                  }`}
                                />

                              )
                            )}

                          </div>

                          <p className="mt-1 text-[10px] text-[#7890aa]">

                            {passwordStrength <= 1
                              ? 'Use at least 6 characters.'
                              : passwordStrength ===
                                  2
                                ? 'Good start. Add more characters.'
                                : passwordStrength ===
                                    3
                                  ? 'Strong password.'
                                  : 'Excellent password.'}

                          </p>

                        </div>
                      )}

                      {errors.password && (
                        <p className="mt-1 text-[11px] text-[#ff8290]">
                          {errors.password}
                        </p>
                      )}

                    </div>

                    {/* =================================================
                        CONFIRM PASSWORD
                       ================================================= */}

                    <div>

                      <label
                        htmlFor="patient-confirm-password"
                        className="mb-[7px] block text-[12px] font-semibold text-[#c8d5e2]"
                      >
                        Confirm Password
                      </label>

                      <div className="relative">

                        <LockKeyhole
                          size={17}
                          className={
                            iconInputBase
                          }
                        />

                        <input
                          id="patient-confirm-password"
                          type={
                            showConfirmPassword
                              ? 'text'
                              : 'password'
                          }
                          value={
                            confirmPassword
                          }
                          onChange={(e) => {

                            setConfirmPassword(
                              e.target.value
                            );

                            setErrors(
                              (current) => ({
                                ...current,
                                confirmPassword:
                                  '',
                                general: '',
                              })
                            );

                          }}
                          placeholder="Re-enter your password"
                          className={`${inputBase} pl-[43px] pr-[45px] ${
                            errors.confirmPassword
                              ? errorInput
                              : ''
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              (current) =>
                                !current
                            )
                          }
                          className="absolute right-[13px] top-1/2 -translate-y-1/2 cursor-pointer text-[#7890aa] transition-colors hover:text-[#54dce5]"
                          aria-label={
                            showConfirmPassword
                              ? 'Hide confirm password'
                              : 'Show confirm password'
                          }
                        >

                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}

                        </button>

                      </div>

                      {errors.confirmPassword && (
                        <p className="mt-1 text-[11px] text-[#ff8290]">
                          {errors.confirmPassword}
                        </p>
                      )}

                    </div>

                    {/* =================================================
                        CREATE ACCOUNT
                       ================================================= */}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="mt-[4px] flex w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#09b9df] to-[#16d9e3] py-[13px] text-[13px] font-bold text-[#021526] shadow-[0_10px_30px_rgba(22,217,227,0.18)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_12px_35px_rgba(22,217,227,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {isLoading
                        ? 'Creating Account...'
                        : 'Create Patient Account'}

                      {!isLoading && (
                        <ArrowRight size={16} />
                      )}

                    </button>

                  </form>

                )}

              </div>

              {/* =====================================================
                  LOGIN FOOTER
                 ===================================================== */}

              <div className="mt-[20px] flex items-center justify-center gap-2 text-center">

                <span className="text-[11px] text-[#637a92]">
                  Already have an account?
                </span>

                <button
                  type="button"
                  onClick={() =>
                    navigate('/patient/login')
                  }
                  className="cursor-pointer text-[11px] font-bold text-[#5ce2e9] transition-colors hover:text-white"
                >
                  Patient Login
                </button>

              </div>

              {/* Security note */}

              <div className="mt-[15px] flex items-center justify-center gap-1.5 text-center">

                <ShieldCheck
                  size={12}
                  className="text-[#16d9e3]"
                />

                <p className="text-[10px] leading-[1.5] text-[#50677f]">
                  Secure registration with email verification
                </p>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}