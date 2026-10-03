import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HOSPITAL_ADMIN_TOKEN_KEY =
  'hospitalflow_hospital_admin_token';

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

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin = async (
    event: React.FormEvent,
  ) => {
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

      const response = await fetch(
        '/api/hospital-admin/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        },
      );

      const data =
        (await response.json()) as
          | LoginResponse
          | { message?: string };

      if (!response.ok) {
        setError(
          'message' in data && data.message
            ? data.message
            : 'Invalid email or password.',
        );
        return;
      }

      const loginData =
        data as LoginResponse;

      sessionStorage.setItem(
        HOSPITAL_ADMIN_TOKEN_KEY,
        loginData.token,
      );

      sessionStorage.setItem(
        'hospitalflow_hospital_admin',
        JSON.stringify(loginData),
      );

      navigate('/hospital-admin/dashboard');
    } catch {
      setError(
        'Unable to connect to the server. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#159570] transition-colors w-full';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-[#d8e1ec]">
        <div className="max-w-[1100px] mx-auto px-[24px] h-[60px] flex items-center justify-between">

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[32px] w-auto object-contain"
          />

          <button
            type="button"
            onClick={() =>
              navigate('/role-selection')
            }
            className="font-semibold text-[#159570] text-[12px] cursor-pointer hover:opacity-80"
          >
            Change Role →
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-[24px] py-[48px]">

        <div className="w-full max-w-[440px]">

          {/* Logo + Heading */}
          <div className="text-center mb-[28px]">

            <div className="flex justify-center mb-[18px]">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-[64px] w-auto object-contain"
              />
            </div>

            <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
              Hospital Admin Login
            </h1>

            <p className="font-normal text-[#526176] text-[14px] mt-[7px]">
              Sign in to manage your hospital operations.
            </p>

          </div>

          {/* Login Card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-[16px]"
            >

              {/* Error */}
              {error && (
                <div className="bg-[#fff1f2] border border-[#f3c3c7] rounded-[10px] px-[12px] py-[10px]">
                  <p className="text-[#c53a45] text-[12px]">
                    {error}
                  </p>
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="hospital-admin-email"
                  className="font-semibold text-[#142033] text-[13px]"
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
                  placeholder="Enter hospital admin email"
                  autoComplete="email"
                  className={inputBase}
                />

              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="hospital-admin-password"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Password
                </label>

                <input
                  id="hospital-admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={inputBase}
                />

              </div>

              {/* Sign In */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#159570] hover:bg-[#117c5e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-[14px] rounded-[10px] py-[12px] transition-colors cursor-pointer"
              >
                {isLoading
                  ? 'Signing In...'
                  : 'Sign In'}
              </button>

            </form>

          </div>

          {/* Information */}
          <div className="mt-[16px] bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] text-center shadow-[0px_2px_12px_0px_rgba(19,36,58,0.04)]">

            <p className="font-semibold text-[#142033] text-[13px]">
              Hospital Administrator
            </p>

            <p className="text-[#7b899c] text-[12px] mt-[5px] leading-[1.5]">
              Use the administrator credentials provided
              by HospitalFlow after hospital approval.
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}