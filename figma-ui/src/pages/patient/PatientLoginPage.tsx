import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function PatientLoginPage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const nextErrors: {
      phone?: string;
      password?: string;
      general?: string;
    } = {};

    if (!phone.trim()) {
      nextErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      nextErrors.phone =
        'Mobile number must be exactly 10 digits';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
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
      const response = await fetch('/api/patients/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          general:
            data?.message ||
            'Invalid mobile number or password',
        });

        return;
      }

      sessionStorage.setItem(
        'hospitalflow_patient',
        JSON.stringify({
          patientId: data.patientId,
          fullName: data.fullName,
          age: data.age,
          phone: data.phone,
          email: data.email,
        })
      );

      alert('Login successful!');

      navigate('/patient/dashboard');
    } catch (error) {
      console.error(
        'Patient login error:',
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

  const inputBase =
    'w-full h-[52px] bg-[#071D31] border border-[#183B55] rounded-[12px] px-[15px] text-[14px] text-white placeholder:text-[#6E899F] outline-none transition-all duration-200 focus:border-[#00D9FF] focus:ring-[3px] focus:ring-[#00D9FF]/10';

  return (
    <div className="patient-login-page min-h-screen bg-[#03111F] text-white overflow-hidden">

      {/* =========================================================
          BACKGROUND GLOW
         ========================================================= */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-180px] left-[-160px] w-[500px] h-[500px] rounded-full bg-[#00D9FF]/10 blur-[130px]" />

        <div className="absolute bottom-[-180px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#0066FF]/10 blur-[130px]" />

        <div className="absolute top-[40%] left-[45%] w-[250px] h-[250px] rounded-full bg-[#00D9FF]/5 blur-[100px]" />

      </div>

      {/* =========================================================
          HEADER
         ========================================================= */}

      <header className="relative z-10 border-b border-white/[0.07] bg-[#03111F]/80 backdrop-blur-xl">

        <div className="max-w-[1280px] mx-auto px-[20px] sm:px-[32px] lg:px-[48px] h-[72px] flex items-center justify-between">

          {/* Logo */}

          <button
            onClick={() => navigate('/patient')}
            className="cursor-pointer flex items-center group"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[38px] w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            />
          </button>

          {/* Staff Login */}

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-[7px] text-[#A7C1D5] text-[13px] font-semibold cursor-pointer hover:text-[#00D9FF] transition-colors"
          >
            Staff Login
            <ArrowRight size={15} />
          </button>

        </div>

      </header>

      {/* =========================================================
          MAIN
         ========================================================= */}

      <main className="relative z-10 min-h-[calc(100vh-72px)] flex items-center justify-center px-[20px] py-[40px] sm:px-[32px] lg:px-[48px]">

        <div className="w-full max-w-[1180px] grid lg:grid-cols-[1fr_460px] gap-[45px] lg:gap-[70px] items-center">

          {/* =====================================================
              LEFT BRAND PANEL
             ===================================================== */}

          <section className="hidden lg:block">

            {/* Small badge */}

            <div className="inline-flex items-center gap-[8px] px-[12px] py-[7px] rounded-full border border-[#00D9FF]/20 bg-[#00D9FF]/[0.06] mb-[22px]">

              <span className="w-[7px] h-[7px] rounded-full bg-[#00D9FF] shadow-[0_0_10px_#00D9FF]" />

              <span className="text-[#67E9FF] text-[11px] font-bold tracking-[1px] uppercase">
                Smart Healthcare Platform
              </span>

            </div>

            {/* Heading */}

            <h1 className="text-[48px] xl:text-[56px] leading-[1.06] font-extrabold tracking-[-2px] max-w-[650px]">

              Healthcare that
              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D9FF] to-[#55BFFF]">
                moves with you.
              </span>

            </h1>

            <p className="mt-[22px] text-[#8EA8BC] text-[16px] leading-[1.7] max-w-[570px]">
              Manage your OPD appointments, digital tokens and
              real-time queue status — all from one simple
              healthcare platform.
            </p>

            {/* Feature cards */}

            <div className="grid grid-cols-2 gap-[12px] mt-[34px] max-w-[580px]">

              {/* Feature 1 */}

              <div className="group rounded-[16px] border border-white/[0.07] bg-white/[0.025] p-[17px] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.04] transition-all duration-200">

                <div className="w-[40px] h-[40px] rounded-[11px] bg-[#00D9FF]/10 flex items-center justify-center mb-[12px]">
                  <Clock3
                    size={20}
                    className="text-[#00D9FF]"
                  />
                </div>

                <p className="font-bold text-white text-[13px]">
                  Real-time OPD
                </p>

                <p className="text-[#7893A8] text-[11px] mt-[4px]">
                  Know your waiting time
                </p>

              </div>

              {/* Feature 2 */}

              <div className="group rounded-[16px] border border-white/[0.07] bg-white/[0.025] p-[17px] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.04] transition-all duration-200">

                <div className="w-[40px] h-[40px] rounded-[11px] bg-[#00D9FF]/10 flex items-center justify-center mb-[12px]">
                  <Activity
                    size={20}
                    className="text-[#00D9FF]"
                  />
                </div>

                <p className="font-bold text-white text-[13px]">
                  Live Queue
                </p>

                <p className="text-[#7893A8] text-[11px] mt-[4px]">
                  Track your token live
                </p>

              </div>

              {/* Feature 3 */}

              <div className="group rounded-[16px] border border-white/[0.07] bg-white/[0.025] p-[17px] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.04] transition-all duration-200">

                <div className="w-[40px] h-[40px] rounded-[11px] bg-[#00D9FF]/10 flex items-center justify-center mb-[12px]">
                  <HeartPulse
                    size={20}
                    className="text-[#00D9FF]"
                  />
                </div>

                <p className="font-bold text-white text-[13px]">
                  Easy Appointments
                </p>

                <p className="text-[#7893A8] text-[11px] mt-[4px]">
                  Book without the queues
                </p>

              </div>

              {/* Feature 4 */}

              <div className="group rounded-[16px] border border-white/[0.07] bg-white/[0.025] p-[17px] hover:border-[#00D9FF]/30 hover:bg-[#00D9FF]/[0.04] transition-all duration-200">

                <div className="w-[40px] h-[40px] rounded-[11px] bg-[#00D9FF]/10 flex items-center justify-center mb-[12px]">
                  <ShieldCheck
                    size={20}
                    className="text-[#00D9FF]"
                  />
                </div>

                <p className="font-bold text-white text-[13px]">
                  Secure Account
                </p>

                <p className="text-[#7893A8] text-[11px] mt-[4px]">
                  Your data stays protected
                </p>

              </div>

            </div>

            {/* Bottom trust line */}

            <div className="flex items-center gap-[9px] mt-[25px] text-[#668399] text-[11px]">

              <CheckCircle2
                size={14}
                className="text-[#00D9FF]"
              />

              <span>
                Designed for faster and smarter OPD experiences
              </span>

            </div>

          </section>

          {/* =====================================================
              LOGIN CARD
             ===================================================== */}

          <section className="w-full max-w-[460px] mx-auto">

            {/* Mobile Logo */}

            <div className="lg:hidden text-center mb-[24px]">

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-[52px] w-auto object-contain mx-auto"
              />

            </div>

            <div className="relative">

              {/* Cyan glow behind card */}

              <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-[#00D9FF]/40 via-transparent to-[#0066FF]/30 blur-[1px]" />

              {/* Card */}

              <div className="relative bg-[#061A2F]/95 backdrop-blur-xl border border-[#1A405C] rounded-[24px] p-[25px] sm:p-[34px] shadow-[0_25px_80px_rgba(0,0,0,0.35)]">

                {/* Card heading */}

                <div className="mb-[25px]">

                  <div className="flex items-center gap-[10px] mb-[15px]">

                    <div className="w-[42px] h-[42px] rounded-[12px] bg-[#00D9FF]/10 border border-[#00D9FF]/15 flex items-center justify-center">

                      <HeartPulse
                        size={21}
                        className="text-[#00D9FF]"
                      />

                    </div>

                    <div>

                      <p className="text-[#6D8CA2] text-[10px] uppercase tracking-[1.5px] font-bold">
                        Patient Portal
                      </p>

                      <div className="flex items-center gap-[5px] mt-[2px]">

                        <Sparkles
                          size={12}
                          className="text-[#00D9FF]"
                        />

                        <span className="text-[#8EA8BC] text-[10px]">
                          Secure access
                        </span>

                      </div>

                    </div>

                  </div>

                  <h2 className="font-extrabold text-white text-[28px] tracking-[-0.7px]">
                    Welcome back
                  </h2>

                  <p className="text-[#7893A8] text-[13px] mt-[6px]">
                    Sign in to continue to your HospitalFlow account.
                  </p>

                </div>

                {/* Form */}

                <form
                  onSubmit={handleLogin}
                  className="flex flex-col gap-[17px]"
                >

                  {/* General Error */}

                  {errors.general && (
                    <div className="flex gap-[10px] items-start bg-[#FF4757]/[0.08] border border-[#FF4757]/25 rounded-[12px] px-[13px] py-[11px]">

                      <div className="w-[7px] h-[7px] rounded-full bg-[#FF5B68] mt-[5px] flex-shrink-0" />

                      <p className="text-[#FF8991] text-[12px] leading-[1.5]">
                        {errors.general}
                      </p>

                    </div>
                  )}

                  {/* Mobile Number */}

                  <div className="flex flex-col gap-[7px]">

                    <label
                      htmlFor="patient-login-phone"
                      className="flex items-center justify-between text-[#B5C9D8] text-[12px] font-semibold"
                    >
                      <span>Mobile Number</span>

                      <span className="text-[#607D92] font-normal">
                        10 digits
                      </span>
                    </label>

                    <div className="relative">

                      <div className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#638196] text-[13px] pointer-events-none">
                        +91
                      </div>

                      <input
                        id="patient-login-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {

                          const value =
                            e.target.value.replace(/\D/g, '');

                          setPhone(value);

                          setErrors((current) => ({
                            ...current,
                            phone:
                              value.length === 0
                                ? 'Mobile number is required'
                                : value.length !== 10
                                  ? 'Mobile number must be exactly 10 digits'
                                  : '',
                            general: '',
                          }));

                        }}
                        placeholder="98765 43210"
                        className={`${inputBase} pl-[52px] ${
                          errors.phone
                            ? 'border-[#FF5B68] focus:border-[#FF5B68] focus:ring-[#FF5B68]/10'
                            : ''
                        }`}
                      />

                    </div>

                    {errors.phone && (
                      <p className="text-[#FF7781] text-[11px]">
                        {errors.phone}
                      </p>
                    )}

                  </div>

                  {/* Password */}

                  <div className="flex flex-col gap-[7px]">

                    <label
                      htmlFor="patient-login-password"
                      className="text-[#B5C9D8] text-[12px] font-semibold"
                    >
                      Password
                    </label>

                    <div className="relative">

                      <LockKeyhole
                        size={17}
                        className="absolute left-[15px] top-1/2 -translate-y-1/2 text-[#638196] pointer-events-none"
                      />

                      <input
                        id="patient-login-password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={password}
                        onChange={(e) => {

                          const value =
                            e.target.value;

                          setPassword(value);

                          setErrors((current) => ({
                            ...current,
                            password:
                              value.trim()
                                ? ''
                                : 'Password is required',
                            general: '',
                          }));

                        }}
                        placeholder="Enter your password"
                        className={`${inputBase} pl-[45px] pr-[48px] ${
                          errors.password
                            ? 'border-[#FF5B68] focus:border-[#FF5B68] focus:ring-[#FF5B68]/10'
                            : ''
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (current) => !current
                          )
                        }
                        className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#607D92] hover:text-[#00D9FF] cursor-pointer transition-colors"
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>

                    </div>

                    {errors.password && (
                      <p className="text-[#FF7781] text-[11px]">
                        {errors.password}
                      </p>
                    )}

                  </div>

                  {/* Forgot password */}

                  <div className="flex justify-end -mt-[2px]">

                    <button
                      type="button"
                      className="text-[#00D9FF] text-[11px] font-semibold cursor-pointer hover:text-[#6EEDFF] transition-colors"
                      onClick={() => {
                        navigate(
                          '/patient/forgot-password'
                        );
                      }}
                    >
                      Forgot password?
                    </button>

                  </div>

                  {/* Sign In */}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group w-full h-[52px] rounded-[12px] bg-gradient-to-r from-[#00BFE8] to-[#00D9FF] text-[#03111F] font-extrabold text-[14px] flex items-center justify-center gap-[8px] cursor-pointer shadow-[0_8px_25px_rgba(0,217,255,0.18)] hover:shadow-[0_10px_32px_rgba(0,217,255,0.28)] hover:brightness-105 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-[16px] h-[16px] border-[2px] border-[#03111F]/30 border-t-[#03111F] rounded-full animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In

                        <ArrowRight
                          size={17}
                          className="group-hover:translate-x-[3px] transition-transform"
                        />
                      </>
                    )}
                  </button>

                </form>

                {/* Divider */}

                <div className="flex items-center gap-[12px] my-[24px]">

                  <div className="h-[1px] flex-1 bg-[#183B55]" />

                  <span className="text-[#58758A] text-[10px] uppercase tracking-[1px]">
                    New to HospitalFlow?
                  </span>

                  <div className="h-[1px] flex-1 bg-[#183B55]" />

                </div>

                {/* Register */}

                <button
                  type="button"
                  onClick={() =>
                    navigate('/patient/register')
                  }
                  className="group w-full h-[48px] rounded-[11px] border border-[#23506D] bg-[#0A243A] text-[#D9F8FF] font-bold text-[13px] flex items-center justify-center gap-[7px] cursor-pointer hover:border-[#00D9FF]/60 hover:bg-[#00D9FF]/[0.06] transition-all duration-200"
                >
                  Create Patient Account

                  <ArrowRight
                    size={15}
                    className="text-[#00D9FF] group-hover:translate-x-[3px] transition-transform"
                  />
                </button>

                {/* Security */}

                <div className="flex items-center justify-center gap-[6px] mt-[18px]">

                  <ShieldCheck
                    size={13}
                    className="text-[#00D9FF]"
                  />

                  <span className="text-[#5E7B90] text-[10px]">
                    Your account is protected with secure authentication
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =========================================================
          FOOTER
         ========================================================= */}

      <footer className="relative z-10 text-center pb-[20px]">

        <p className="text-[#4E697D] text-[10px]">
          © {new Date().getFullYear()} HospitalFlow · Smart OPD Coordination
        </p>

      </footer>

    </div>
  );
}