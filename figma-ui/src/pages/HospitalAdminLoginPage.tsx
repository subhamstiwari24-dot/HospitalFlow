import { useState, type FormEvent } from 'react';
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

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // ----------------------------------
  // LOGIN
  // ----------------------------------

  const handleLogin = async (event: FormEvent) => {
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

      const loginData = data as LoginResponse;

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

  return (
    <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Top left glow */}
        <div
          className="
            absolute
            top-[-180px]
            left-[-160px]
            w-[450px]
            h-[450px]
            rounded-full
            bg-cyan-400/10
            blur-[120px]
          "
        />

        {/* Right glow */}
        <div
          className="
            absolute
            top-[25%]
            right-[-180px]
            w-[500px]
            h-[500px]
            rounded-full
            bg-blue-500/10
            blur-[120px]
          "
        />

        {/* Bottom glow */}
        <div
          className="
            absolute
            bottom-[-220px]
            left-[35%]
            w-[500px]
            h-[400px]
            rounded-full
            bg-cyan-400/5
            blur-[120px]
          "
        />

        {/* Grid */}
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
        className="
          relative
          z-10
          h-[76px]
          border-b
          border-white/10
          bg-[#031326]/75
          backdrop-blur-xl
        "
      >

        <div
          className="
            max-w-[1180px]
            mx-auto
            h-full
            px-5
            sm:px-8
            flex
            items-center
            justify-between
          "
        >

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >

            <div
              className="
                w-[42px]
                h-[42px]
                rounded-[12px]
                bg-white/[0.07]
                border
                border-white/10
                flex
                items-center
                justify-center
                overflow-hidden
              "
            >

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px] h-auto object-contain"
              />

            </div>

            <div className="text-left">

              <div
                className="
                  font-bold
                  text-[17px]
                  tracking-tight
                "
              >
                Hospital
                <span className="text-[#16d9e3]">
                  Flow
                </span>
              </div>

              <div
                className="
                  text-[9px]
                  text-slate-500
                  tracking-[0.12em]
                  uppercase
                "
              >
                Smart OPD Platform
              </div>

            </div>

          </button>

          {/* Change Role */}

          <button
            type="button"
            onClick={() =>
              navigate('/role-selection')
            }
            className="
              text-[12px]
              sm:text-[13px]
              font-semibold
              text-slate-400
              hover:text-[#16d9e3]
              transition-colors
            "
          >
            Change Role →
          </button>

        </div>

      </header>

      {/* =========================================
          MAIN
      ========================================= */}

      <main
        className="
          relative
          z-10
          min-h-[calc(100vh-76px)]
          flex
          items-center
          justify-center
          px-5
          sm:px-8
          py-12
        "
      >

        <div className="w-full max-w-[460px]">

          {/* =====================================
              LOGO + HEADING
          ===================================== */}

          <div className="text-center mb-8">

            <div
              className="
                relative
                inline-flex
                items-center
                justify-center
                mb-5
              "
            >

              {/* Glow */}

              <div
                className="
                  absolute
                  w-[115px]
                  h-[115px]
                  rounded-full
                  bg-cyan-400/10
                  blur-[30px]
                "
              />

              {/* Logo container */}

              <div
                className="
                  relative
                  w-[84px]
                  h-[84px]
                  rounded-[24px]
                  bg-white/[0.07]
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_45px_rgba(22,217,227,0.12)]
                "
              >

                <img
                  src="/assets/logo.png"
                  alt="HospitalFlow"
                  className="w-[54px]"
                />

              </div>

            </div>

            {/* Badge */}

            <div className="flex justify-center mb-4">

              <span
                className="
                  inline-flex
                  items-center
                  px-4
                  py-2
                  rounded-full
                  bg-[#16d9e3]/10
                  border
                  border-[#16d9e3]/20
                  text-[#8ef8ff]
                  text-[11px]
                  font-medium
                "
              >
                Hospital Administration
              </span>

            </div>

            <h1
              className="
                text-[30px]
                sm:text-[34px]
                font-bold
                tracking-tight
              "
            >
              Hospital Admin{' '}
              <span className="text-[#16d9e3]">
                Login
              </span>
            </h1>

            <p
              className="
                text-[14px]
                text-slate-400
                mt-3
              "
            >
              Sign in to manage your hospital operations.
            </p>

          </div>

          {/* =====================================
              LOGIN CARD
          ===================================== */}

          <div
            className="
              relative
              rounded-[24px]
              p-[1px]
              bg-gradient-to-br
              from-[#16d9e3]/40
              via-white/10
              to-transparent
            "
          >

            <div
              className="
                relative
                rounded-[23px]
                bg-[#071b31]/95
                border
                border-white/[0.07]
                p-6
                sm:p-8
                backdrop-blur-xl
              "
            >

              <form
                onSubmit={handleLogin}
                className="flex flex-col gap-5"
              >

                {/* Error */}

                {error && (
                  <div
                    className="
                      rounded-[12px]
                      border
                      border-red-400/20
                      bg-red-400/10
                      px-4
                      py-3
                    "
                  >
                    <p className="text-red-300 text-[12px]">
                      {error}
                    </p>
                  </div>
                )}

                {/* Email */}

                <div>

                  <label
                    htmlFor="hospital-admin-email"
                    className="
                      block
                      text-[12px]
                      font-semibold
                      text-slate-300
                      mb-2
                    "
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
                    className="
                      w-full
                      bg-white/[0.045]
                      border
                      border-white/10
                      rounded-[12px]
                      px-4
                      py-3
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

                </div>

                {/* Password */}

                <div>

                  <label
                    htmlFor="hospital-admin-password"
                    className="
                      block
                      text-[12px]
                      font-semibold
                      text-slate-300
                      mb-2
                    "
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
                    className="
                      w-full
                      bg-white/[0.045]
                      border
                      border-white/10
                      rounded-[12px]
                      px-4
                      py-3
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

                </div>

                {/* Sign In */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="
                    w-full
                    mt-2
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
              ADMIN INFORMATION
          ===================================== */}

          <div
            className="
              mt-5
              rounded-[20px]
              bg-[#071b31]/80
              border
              border-white/[0.07]
              p-5
              text-center
            "
          >

            <div
              className="
                mx-auto
                w-[42px]
                h-[42px]
                rounded-[13px]
                bg-[#16d9e3]/10
                border
                border-[#16d9e3]/15
                flex
                items-center
                justify-center
                mb-3
              "
            >
              <span className="text-[#16d9e3] text-[18px]">
                ✓
              </span>
            </div>

            <p
              className="
                font-semibold
                text-white
                text-[13px]
              "
            >
              Authorized Hospital Administrator
            </p>

            <p
              className="
                text-slate-500
                text-[12px]
                mt-1.5
                leading-[1.6]
              "
            >
              Use the administrator credentials provided
              by HospitalFlow after hospital approval.
            </p>

          </div>

          {/* Back */}

          <button
            type="button"
            onClick={() =>
              navigate('/role-selection')
            }
            className="
              block
              mx-auto
              mt-5
              text-[12px]
              text-slate-500
              hover:text-[#16d9e3]
              transition-colors
            "
          >
            ← Back to role selection
          </button>

        </div>

      </main>

    </div>
  );
}