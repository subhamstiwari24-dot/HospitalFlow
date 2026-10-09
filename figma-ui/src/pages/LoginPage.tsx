
import { useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  HeartPulse,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{
    employeeId?: string;
    password?: string;
    general?: string;
  }>({});

  const validate = () => {
    const nextErrors: {
      employeeId?: string;
      password?: string;
    } = {};

    if (!employeeId.trim()) {
      nextErrors.employeeId =
        role === 'Doctor'
          ? 'Doctor ID is required.'
          : 'Employee ID is required.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
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

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          setErrors({
            general: data?.message || 'Doctor login failed.',
          });
          return;
        }

        sessionStorage.setItem(
          'hospitalflow_doctor',
          JSON.stringify(data)
        );

        navigate('/doctor/dashboard');
        return;
      }

      const adminData = await loginAdmin(
        employeeId.trim(),
        password
      );

      if (adminData.role === 'SUPER_ADMIN') {
        navigate('/super-admin/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      let message = 'Unable to connect to the server. Please try again.';

      if (error instanceof AdminApiError) {
        if (error.status === 400) {
          message = 'Invalid login request.';
        } else if (error.status === 401) {
          message = 'Invalid employee ID or password.';
        } else if (error.status === 403) {
          message = 'You are not authorized to access this portal.';
        } else if (error.status >= 500) {
          message = 'Server error. Please try again later.';
        }
      }

      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="staff-login-page min-h-screen bg-[#f5f9fc] text-[#10213f]">
      {/* Header */}
      <header className="relative z-10 border-b border-[#e1eaf3] bg-white">
        <div className="mx-auto flex h-[76px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#e1eaf3] bg-white">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-9 w-auto object-contain"
              />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Hospital<span className="text-[#19c9d5]">Flow</span>
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#7890aa]">
                Smart OPD Platform
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/patient/login')}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#607994] transition hover:bg-[#e9fbfd] hover:text-[#078f9f]"
          >
            Patient Login <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Main page */}
      <main className="relative min-h-[calc(100vh-76px)] overflow-x-clip px-5 py-10 sm:px-8 sm:py-12 lg:flex lg:items-center lg:px-10 lg:py-12">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="staff-login-layout relative mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-12 xl:gap-16">
          {/* Left introduction */}
          <section className="hidden min-w-0 lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bceff3] bg-[#e9fbfd] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#078f9f]">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#19c9d5]" />
              Smart healthcare platform
            </div>

            <h1 className="max-w-[600px] text-5xl font-extrabold leading-[1.12] tracking-tight text-[#10213f] xl:text-[56px]">
              Healthcare that
              <br />
              <span className="text-[#19c9d5]">moves with you.</span>
            </h1>

            <p className="mt-6 max-w-[530px] text-base leading-8 text-[#7890aa]">
              Manage hospital operations, coordinate OPD appointments
              and support efficient patient care through one connected
              healthcare platform.
            </p>

            <div className="mt-8 grid max-w-[530px] grid-cols-2 gap-4">
              <FeatureCard
                icon={<Clock3 size={21} />}
                title="OPD Operations"
                description="Keep daily hospital activities organised."
              />

              <FeatureCard
                icon={<Activity size={21} />}
                title="Live Coordination"
                description="Coordinate appointments and queues."
              />

              <FeatureCard
                icon={<Stethoscope size={21} />}
                title="Doctor Workspace"
                description="Access your assigned dashboard."
              />

              <FeatureCard
                icon={<ShieldCheck size={21} />}
                title="Secure Access"
                description="Protected role-based sign in."
              />
            </div>

            <p className="mt-7 flex items-center gap-2 text-xs font-medium text-[#7890aa]">
              <CheckCircle2
                size={16}
                className="shrink-0 text-[#19c9d5]"
              />
              Designed for faster and smarter hospital experiences
            </p>
          </section>

          {/* Right login section */}
          <section className="mx-auto w-full min-w-0 max-w-[440px]">
            {/* Mobile-only heading */}
            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#dce8f3] bg-white text-[#19c9d5] shadow-sm">
                <HeartPulse size={32} />
              </div>

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#bceff3] bg-[#e9fbfd] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#078f9f]">
                <span className="h-2 w-2 rounded-full bg-[#19c9d5]" />
                Hospital Operations
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#10213f] sm:text-4xl">
                Staff <span className="text-[#19c9d5]">Login</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#7890aa]">
                Sign in to manage HospitalFlow operations.
              </p>
            </div>

            {/* Login card */}
            <div className="w-full rounded-[26px] border border-[#dce8f3] bg-white p-6 shadow-[0_18px_55px_rgba(16,33,63,0.08)] sm:p-8">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c9f2f5] bg-[#e9fbfd] text-[#079eaf]">
                  <LockKeyhole size={23} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7890aa]">
                    Staff portal
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#10213f]">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-xs text-[#7890aa]">
                    Sign in to continue securely
                  </p>
                </div>
              </div>

              {/* Role selection */}
              <div className="mb-6">
                <label className="mb-3 block text-sm font-semibold text-[#34465e]">
                  Login as
                </label>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f3f7fb] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRole('Doctor');
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 rounded-[10px] border px-3 py-3 text-sm font-semibold transition ${
                      role === 'Doctor'
                        ? 'border-[#19c9d5] bg-[#19c9d5] text-[#06243b] shadow-sm'
                        : 'border-transparent bg-white text-[#607994] hover:border-[#bceff3]'
                    }`}
                  >
                    <Stethoscope size={16} />
                    Doctor
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRole('Admin');
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 rounded-[10px] border px-3 py-3 text-sm font-semibold transition ${
                      role === 'Admin'
                        ? 'border-[#19c9d5] bg-[#19c9d5] text-[#06243b] shadow-sm'
                        : 'border-transparent bg-white text-[#607994] hover:border-[#bceff3]'
                    }`}
                  >
                    <Building2 size={16} />
                    Admin
                  </button>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {errors.general && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm leading-6 text-red-700">
                      {errors.general}
                    </p>
                  </div>
                )}

                {/* Employee ID */}
                <div>
                  <label
                    htmlFor="staff-employee-id"
                    className="mb-2 block text-sm font-semibold text-[#34465e]"
                  >
                    {role === 'Doctor'
                      ? 'Email or Doctor ID'
                      : 'Employee ID'}
                  </label>

                  <input
                    id="staff-employee-id"
                    type="text"
                    value={employeeId}
                    onChange={(event) => {
                      setEmployeeId(event.target.value);
                      setErrors((current) => ({
                        ...current,
                        employeeId: '',
                        general: '',
                      }));
                    }}
                    placeholder={
                      role === 'Doctor'
                        ? 'Enter email or doctor ID'
                        : 'Enter employee ID'
                    }
                    autoComplete="username"
                    aria-invalid={Boolean(errors.employeeId)}
                    className="w-full rounded-xl border border-[#d8e4ef] bg-[#f1f6ff] px-4 py-3.5 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />

                  {errors.employeeId && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.employeeId}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="staff-password"
                    className="mb-2 block text-sm font-semibold text-[#34465e]"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setErrors((current) => ({
                          ...current,
                          password: '',
                          general: '',
                        }));
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password)}
                      className="w-full rounded-xl border border-[#d8e4ef] bg-[#f1f6ff] px-4 py-3.5 pr-12 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? 'Hide password' : 'Show password'
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-[#7890aa] transition hover:text-[#079eaf]"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me and forgot password */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      className="h-4 w-4 rounded accent-[#19c9d5]"
                    />
                    <span className="text-xs text-[#7890aa]">
                      Remember me
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      setErrors({
                        general:
                          'Please contact your platform administrator to reset your staff password.',
                      })
                    }
                    className="text-xs font-semibold text-[#079eaf] transition hover:text-[#10213f]"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign in */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19c9d5] px-5 py-4 text-sm font-extrabold text-[#06243b] shadow-[0_8px_24px_rgba(25,201,213,0.18)] transition hover:bg-[#35d7e0] focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06243b]/30 border-t-[#06243b]" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#dce8f3]" />
                <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-[#7890aa]">
                  Secure staff access
                </span>
                <div className="h-px flex-1 bg-[#dce8f3]" />
              </div>

              <p className="flex items-center justify-center gap-2 text-center text-xs leading-5 text-[#7890aa]">
                <ShieldCheck
                  size={15}
                  className="shrink-0 text-[#19c9d5]"
                />
                Your account is protected by authentication.
              </p>
            </div>

            {/* Patient portal */}
            <div className="mt-5 rounded-[22px] border border-[#dce8f3] bg-white p-5 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9fbfd] text-[#079eaf]">
                <UserRound size={21} />
              </div>

              <p className="text-sm font-bold text-[#10213f]">
                Are you a patient?
              </p>

              <p className="mt-1 text-xs leading-5 text-[#7890aa]">
                Log in or create an account to manage your OPD appointments.
              </p>

              <button
                type="button"
                onClick={() => navigate('/patient/login')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#19c9d5] px-4 py-3 text-sm font-bold text-[#06243b] transition hover:bg-[#35d7e0]"
              >
                Patient Login <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/patient/register')}
                className="mt-2 flex w-full items-center justify-center rounded-xl border border-[#d8e4ef] bg-white px-4 py-3 text-sm font-semibold text-[#607994] transition hover:border-[#19c9d5] hover:text-[#078f9f]"
              >
                Create Patient Account
              </button>
            </div>

            <p className="mt-5 text-center text-xs text-[#91a2b8]">
              HospitalFlow · Smart OPD Platform
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-[#e2edf5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bceff3] hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7fafc] text-[#079eaf]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#10213f]">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-5 text-[#7890aa]">
        {description}
      </p>
    </div>
  );
}
