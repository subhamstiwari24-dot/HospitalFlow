import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminApiError } from '../services/adminApi';

type Role = 'Doctor' | 'Admin';

export default function LoginPage() {
  const navigate = useNavigate();

  const { login: loginAdmin } = useAdminAuth();

  const [role, setRole] = useState<Role>('Doctor');

  const [employeeId, setEmployeeId] = useState('');

  const [password, setPassword] = useState('');

  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    employeeId?: string;
    password?: string;
    general?: string;
  }>({});

  // -----------------------------
  // Validation
  // -----------------------------

  const validate = () => {
    const nextErrors: {
      employeeId?: string;
      password?: string;
    } = {};

    if (!employeeId.trim()) {
      nextErrors.employeeId =
        role === 'Doctor'
          ? 'Doctor ID is required'
          : 'Employee ID is required';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  // -----------------------------
  // Login
  // -----------------------------

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // -----------------------------
      // Doctor Login
      // -----------------------------

      if (role === 'Doctor') {
        const response = await fetch('/api/doctors/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            identifier: employeeId.trim(),
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setErrors({
            general:
              data?.message || 'Doctor login failed',
          });

          return;
        }

        sessionStorage.setItem(
          'hospitalflow_doctor',
          JSON.stringify(data),
        );

        navigate('/doctor/dashboard');

        return;
      }

      // -----------------------------
      // Admin Login
      // -----------------------------

      const adminData = await loginAdmin(
        employeeId.trim(),
        password,
      );

      if (adminData.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      let message =
        'Unable to connect to the server.';

      if (error instanceof AdminApiError) {
        if (error.status === 400) {
          message = 'Invalid login request.';
        } else if (error.status === 401) {
          message =
            'Invalid employee ID or password.';
        } else if (error.status === 403) {
          message =
            'You are not authorized to access the admin panel.';
        } else if (error.status >= 500) {
          message =
            'Server error. Please try again later.';
        }
      }

      setErrors({
        general: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div
          className="absolute top-[-180px] left-[-150px]
          w-[420px] h-[420px]
          rounded-full
          bg-cyan-400/10
          blur-[110px]"
        />

        <div
          className="absolute top-[25%] right-[-180px]
          w-[500px] h-[500px]
          rounded-full
          bg-blue-500/10
          blur-[120px]"
        />

        <div
          className="absolute bottom-[-220px] left-[35%]
          w-[500px] h-[400px]
          rounded-full
          bg-cyan-400/5
          blur-[120px]"
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />

      </div>

      {/* =========================================
          HEADER
      ========================================= */}

      <header
        className="relative z-10 h-[76px]
        border-b border-white/10
        bg-[#031326]/75
        backdrop-blur-xl"
      >

        <div
          className="max-w-[1180px] mx-auto
          h-full px-5 sm:px-8
          flex items-center justify-between"
        >

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >

            <div
              className="w-[42px] h-[42px]
              rounded-[12px]
              bg-white/[0.07]
              border border-white/10
              flex items-center justify-center
              overflow-hidden"
            >

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px] h-auto object-contain"
              />

            </div>

            <div className="text-left">

              <div className="font-bold text-[17px] tracking-tight">
                Hospital
                <span className="text-[#16d9e3]">
                  Flow
                </span>
              </div>

              <div
                className="text-[9px]
                text-slate-500
                tracking-[0.12em]
                uppercase"
              >
                Smart OPD Platform
              </div>

            </div>

          </button>

          {/* Patient Booking */}
          <button
            type="button"
            onClick={() => navigate('/patient')}
            className="text-[12px] sm:text-[13px]
            font-semibold
            text-slate-400
            hover:text-[#16d9e3]
            transition-colors"
          >
            Patient Booking →
          </button>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main
        className="relative z-10
        min-h-[calc(100vh-76px)]
        flex items-center justify-center
        px-5 sm:px-8
        py-12 sm:py-16"
      >

        <div className="w-full max-w-[460px]">

          {/* =====================================
              HEADING
          ===================================== */}

          <div className="text-center mb-8">

            {/* Logo Glow */}

            <div
              className="relative
              inline-flex
              items-center
              justify-center
              mb-5"
            >

              <div
                className="absolute
                w-[110px]
                h-[110px]
                rounded-full
                bg-cyan-400/10
                blur-[28px]"
              />

              <div
                className="relative
                w-[82px]
                h-[82px]
                rounded-[24px]
                bg-white/[0.07]
                border border-white/10
                flex items-center justify-center
                shadow-[0_0_45px_rgba(22,217,227,0.12)]"
              >

                <img
                  src="/assets/logo.png"
                  alt="HospitalFlow"
                  className="w-[52px]"
                />

              </div>

            </div>

            {/* Badge */}

            <div className="flex justify-center mb-4">

              <span
                className="inline-flex
                items-center
                px-4 py-2
                rounded-full
                bg-[#16d9e3]/10
                border border-[#16d9e3]/20
                text-[#8ef8ff]
                text-[11px]
                font-medium"
              >
                Hospital Operations
              </span>

            </div>

            <h1
              className="text-[30px]
              sm:text-[34px]
              font-bold
              tracking-tight"
            >
              Staff{' '}
              <span className="text-[#16d9e3]">
                Login
              </span>
            </h1>

            <p
              className="text-[14px]
              text-slate-400
              mt-3"
            >
              Sign in to manage HospitalFlow operations.
            </p>

          </div>

          {/* =====================================
              LOGIN CARD
          ===================================== */}

          <div
            className="relative
            rounded-[24px]
            p-[1px]
            bg-gradient-to-br
            from-cyan-400/30
            via-white/10
            to-transparent"
          >

            <div
              className="relative
              rounded-[23px]
              bg-[#071b31]/95
              border border-white/[0.07]
              p-6 sm:p-8
              backdrop-blur-xl"
            >

              {/* =================================
                  ROLE SELECTOR
              ================================= */}

              <div className="mb-6">

                <label
                  className="block
                  text-[12px]
                  font-semibold
                  text-slate-300
                  mb-3"
                >
                  Login as
                </label>

                <div className="grid grid-cols-2 gap-2">

                  {/* Doctor */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Doctor');
                      setErrors({});
                    }}
                    className={`
                      py-3
                      rounded-[12px]
                      border
                      text-[13px]
                      font-semibold
                      transition-all
                      ${
                        role === 'Doctor'
                          ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3] shadow-[0_0_20px_rgba(22,217,227,0.18)]'
                          : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-[#16d9e3]/50 hover:text-white'
                      }
                    `}
                  >
                    Doctor
                  </button>

                  {/* Admin */}

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Admin');
                      setErrors({});
                    }}
                    className={`
                      py-3
                      rounded-[12px]
                      border
                      text-[13px]
                      font-semibold
                      transition-all
                      ${
                        role === 'Admin'
                          ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3] shadow-[0_0_20px_rgba(22,217,227,0.18)]'
                          : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-[#16d9e3]/50 hover:text-white'
                      }
                    `}
                  >
                    Admin
                  </button>

                </div>

              </div>

              {/* =================================
                  FORM
              ================================= */}

              <form
                onSubmit={handleLogin}
                className="flex flex-col gap-5"
              >

                {/* General Error */}

                {errors.general && (
                  <div
                    className="rounded-[12px]
                    border border-red-400/20
                    bg-red-400/10
                    px-4 py-3"
                  >
                    <p className="text-red-300 text-[12px]">
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Employee / Doctor ID */}

                <div>

                  <label
                    htmlFor="employee-id"
                    className="block
                    text-[12px]
                    font-semibold
                    text-slate-300
                    mb-2"
                  >
                    {role === 'Doctor'
                      ? 'Email or Doctor ID'
                      : 'Employee ID'}
                  </label>

                  <input
                    id="employee-id"
                    type="text"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);

                      setErrors((current) => ({
                        ...current,
                        employeeId: '',
                      }));
                    }}
                    placeholder={
                      role === 'Doctor'
                        ? 'Enter email or doctor ID'
                        : 'Enter employee ID'
                    }
                    autoComplete="username"
                    className="
                      w-full
                      bg-white/[0.045]
                      border border-white/10
                      rounded-[12px]
                      px-4 py-3
                      text-[14px]
                      text-white
                      placeholder:text-slate-600
                      outline-none
                      focus:border-[#16d9e3]
                      focus:ring-2
                      focus:ring-[#16d9e3]/10
                      transition-all
                    "
                  />

                  {errors.employeeId && (
                    <p className="text-red-300 text-[11px] mt-1.5">
                      {errors.employeeId}
                    </p>
                  )}

                </div>

                {/* Password */}

                <div>

                  <label
                    htmlFor="staff-password"
                    className="block
                    text-[12px]
                    font-semibold
                    text-slate-300
                    mb-2"
                  >
                    Password
                  </label>

                  <input
                    id="staff-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      setErrors((current) => ({
                        ...current,
                        password: '',
                      }));
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="
                      w-full
                      bg-white/[0.045]
                      border border-white/10
                      rounded-[12px]
                      px-4 py-3
                      text-[14px]
                      text-white
                      placeholder:text-slate-600
                      outline-none
                      focus:border-[#16d9e3]
                      focus:ring-2
                      focus:ring-[#16d9e3]/10
                      transition-all
                    "
                  />

                  {errors.password && (
                    <p className="text-red-300 text-[11px] mt-1.5">
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* Remember / Forgot */}

                <div className="flex items-center justify-between">

                  <label
                    className="flex items-center
                    gap-2
                    cursor-pointer"
                  >

                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(e.target.checked)
                      }
                      className="w-4 h-4 accent-[#16d9e3]"
                    />

                    <span className="text-slate-400 text-[12px]">
                      Remember me
                    </span>

                  </label>

                  <button
                    type="button"
                    className="
                      text-[#16d9e3]
                      text-[12px]
                      font-semibold
                      hover:text-[#8ef8ff]
                    "
                  >
                    Forgot password?
                  </button>

                </div>

                {/* Sign In */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    w-full
                    bg-[#16d9e3]
                    hover:bg-[#5deaf0]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-[#031326]
                    rounded-[12px]
                    py-3
                    font-bold
                    text-[14px]
                    transition-all
                    shadow-[0_8px_25px_rgba(22,217,227,0.14)]
                  "
                >
                  {isLoading
                    ? 'Signing In...'
                    : 'Sign In'}
                </button>

              </form>

            </div>

          </div>

          {/* =====================================
              PATIENT SECTION
          ===================================== */}

          <div
            className="
              mt-5
              rounded-[20px]
              bg-[#071b31]/80
              border border-white/[0.07]
              p-5
              text-center
            "
          >

            <p className="font-semibold text-white text-[13px]">
              Are you a patient?
            </p>

            <p className="text-slate-500 text-[12px] mt-1">
              Login or create an account to manage your OPD appointments.
            </p>

            <button
              type="button"
              onClick={() => navigate('/patient/login')}
              className="
                w-full
                mt-4
                bg-white/[0.05]
                border border-[#16d9e3]/30
                hover:bg-[#16d9e3]/10
                text-[#8ef8ff]
                rounded-[12px]
                py-2.5
                font-semibold
                text-[13px]
                transition
              "
            >
              Patient Login →
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/patient/register')
              }
              className="
                w-full
                mt-2
                bg-transparent
                border border-white/10
                hover:border-white/20
                text-slate-400
                hover:text-white
                rounded-[12px]
                py-2.5
                font-semibold
                text-[13px]
                transition
              "
            >
              Create Patient Account
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}