
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

const HOSPITAL_ADMIN_TOKEN_KEY = 'hospitalflow_hospital_admin_token';

interface LoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: 'HOSPITAL_ADMIN';
  hospitalId: number;
}

export default function HospitalAdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('/api/hospital-admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(
          data?.message ||
            data?.error ||
            'Invalid email or password.'
        );
        return;
      }

      if (!data?.token) {
        setError('Login response did not contain an authentication token.');
        return;
      }

      const loginData = data as LoginResponse;

      sessionStorage.setItem(
        HOSPITAL_ADMIN_TOKEN_KEY,
        loginData.token
      );

      sessionStorage.setItem(
        'hospitalflow_hospital_admin',
        JSON.stringify(loginData)
      );

      navigate('/hospital-admin/dashboard');
    } catch {
      setError(
        'Unable to connect to the server. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9fc] text-[#10213f]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e1eaf3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#e1eaf3] bg-white">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-9 w-9 object-contain"
              />
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight text-[#10213f]">
                Hospital<span className="text-[#19c9d5]">Flow</span>
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7890aa]">
                Smart OPD Platform
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/role-selection')}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#078f9f] transition hover:bg-[#e9fbfd]"
          >
            Change Role <span aria-hidden="true">→</span>
          </button>
        </div>
      </header>

      {/* Login page */}
      <main className="relative overflow-hidden px-5 py-10 sm:px-8 sm:py-14 lg:py-16">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1180px] items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          {/* Left introduction */}
          <section className="hidden lg:block">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#bceff3] bg-[#e9fbfd] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#078f9f]">
              <span className="h-2 w-2 rounded-full bg-[#19c9d5]" />
              Hospital management portal
            </div>

            <h1 className="max-w-[650px] text-5xl font-extrabold leading-[1.12] tracking-tight text-[#10213f] xl:text-[60px]">
              Smarter hospital
              <br />
              <span className="text-[#19c9d5]">management starts here.</span>
            </h1>

            <p className="mt-6 max-w-[570px] text-base leading-8 text-[#7890aa]">
              Access your hospital workspace to coordinate OPD operations,
              manage doctors and appointments, and keep your hospital running
              smoothly.
            </p>

            <div className="mt-9 grid max-w-[590px] grid-cols-2 gap-4">
              <FeatureCard
                icon="◷"
                title="OPD Operations"
                description="Manage daily hospital activities."
              />
              <FeatureCard
                icon="♡"
                title="Doctor Management"
                description="Keep your medical team organised."
              />
              <FeatureCard
                icon="▤"
                title="Appointments"
                description="Coordinate patient appointments."
              />
              <FeatureCard
                icon="✓"
                title="Secure Access"
                description="Sign in to your authorised account."
              />
            </div>

            <p className="mt-7 flex items-center gap-2 text-xs font-medium text-[#7890aa]">
              <span className="text-[#19c9d5]">✓</span>
              Designed for streamlined hospital operations
            </p>
          </section>

          {/* Right login panel */}
          <section className="mx-auto w-full max-w-[470px]">
            {/* Mobile heading */}
            <div className="mb-7 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#d8edf2] bg-white text-3xl shadow-sm">
                🏥
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#10213f]">
                Hospital Admin
                <span className="text-[#19c9d5]"> Login</span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#7890aa]">
                Sign in to manage your hospital operations.
              </p>
            </div>

            <div className="rounded-[26px] border border-[#dce8f3] bg-white p-6 shadow-[0_18px_55px_rgba(16,33,63,0.08)] sm:p-9">
              {/* Card heading */}
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#c9f2f5] bg-[#e9fbfd] text-2xl text-[#079eaf]">
                  ♙
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#7890aa]">
                    Hospital portal
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold text-[#10213f]">
                    Welcome back
                  </h2>
                  <p className="mt-1 text-xs text-[#7890aa]">
                    Secure administrator access
                  </p>
                </div>
              </div>

              <p className="mb-7 text-sm leading-6 text-[#7890aa]">
                Sign in to continue to your HospitalFlow account.
              </p>

              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                  >
                    <p className="text-sm font-medium leading-6 text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label
                    htmlFor="hospital-admin-email"
                    className="mb-2 block text-sm font-semibold text-[#34465e]"
                  >
                    Admin Email
                  </label>

                  <input
                    id="hospital-admin-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError('');
                    }}
                    placeholder="admin@hospital.com"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-[#d8e4ef] bg-[#f1f6ff] px-4 py-3.5 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="hospital-admin-password"
                      className="text-sm font-semibold text-[#34465e]"
                    >
                      Password
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      id="hospital-admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-[#d8e4ef] bg-[#f1f6ff] px-4 py-3.5 pr-16 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      className="absolute inset-y-0 right-3 px-2 text-xs font-semibold text-[#078f9f] hover:text-[#10213f]"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19c9d5] px-5 py-4 text-sm font-extrabold text-[#06243b] shadow-[0_8px_24px_rgba(25,201,213,0.18)] transition hover:bg-[#35d7e0] focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06243b]/30 border-t-[#06243b]" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </form>

              {/* Account information */}
              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#dce8f3]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7890aa]">
                  Administrator access
                </span>
                <div className="h-px flex-1 bg-[#dce8f3]" />
              </div>

              <div className="rounded-2xl border border-[#e0eff3] bg-[#f5fcfd] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-[#079eaf] shadow-sm">
                    ✓
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#123b56]">
                      Authorised Hospital Administrator
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-[#7890aa]">
                      Use the administrator credentials provided by
                      HospitalFlow after your hospital has been approved.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#7890aa]">
                <span className="text-[#19c9d5]">♢</span>
                Your account is protected by authentication.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/role-selection')}
              className="mx-auto mt-6 block rounded-lg px-4 py-2 text-sm font-semibold text-[#7890aa] transition hover:bg-white hover:text-[#078f9f]"
            >
              ← Back to role selection
            </button>
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
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e2edf5] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#bceff3] hover:shadow-md">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e7fafc] text-xl text-[#079eaf]">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-[#10213f]">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-[#7890aa]">{description}</p>
    </div>
  );
}
