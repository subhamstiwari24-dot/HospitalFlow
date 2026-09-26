import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

type Role = 'Doctor' | 'Admin';

export default function LoginPage() {
  const navigate = useNavigate();

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    try {
      if (role === 'Doctor') {
        const response = await fetch('/api/doctors/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: employeeId.trim(),
            password,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          setErrors({ general: data?.message || 'Doctor login failed' });
          return;
        }
        sessionStorage.setItem('hospitalflow_doctor', JSON.stringify(data));
        navigate('/doctor/dashboard');
      } else {
        setErrors({ general: 'Admin authentication is not configured in the current backend.' });
      }
    } catch {
      setErrors({ general: 'Unable to connect to the server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputBase =
    'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#d8e1ec]">
        <div className="max-w-[1100px] mx-auto px-[24px] h-[60px] flex items-center justify-between">

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[32px] w-auto object-contain"
          />

          <button
            onClick={() => navigate('/patient')}
            className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
          >
            Patient Booking →
          </button>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-[24px] py-[48px]">

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
              Staff Login
            </h1>

            <p className="font-normal text-[#526176] text-[14px] mt-[7px]">
              Sign in to manage HospitalFlow operations.
            </p>

          </div>

          {/* Staff Login Card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            {/* Role Selector */}
            <div className="mb-[20px]">

              <label className="block font-semibold text-[#142033] text-[13px] mb-[8px]">
                Login as
              </label>

              <div className="grid grid-cols-2 gap-[8px]">

                <button
                  type="button"
                  onClick={() => {
                    setRole('Doctor');
                    setErrors({});
                  }}
                  className={`py-[10px] rounded-[9px] border text-[13px] font-semibold transition-colors cursor-pointer ${
                    role === 'Doctor'
                      ? 'bg-[#155ead] text-white border-[#155ead]'
                      : 'bg-white text-[#526176] border-[#d8e1ec] hover:border-[#155ead]'
                  }`}
                >
                  Doctor
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('Admin');
                    setErrors({});
                  }}
                  className={`py-[10px] rounded-[9px] border text-[13px] font-semibold transition-colors cursor-pointer ${
                    role === 'Admin'
                      ? 'bg-[#155ead] text-white border-[#155ead]'
                      : 'bg-white text-[#526176] border-[#d8e1ec] hover:border-[#155ead]'
                  }`}
                >
                  Admin
                </button>

              </div>

            </div>

            {/* Staff Form */}
            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-[16px]"
            >

              {errors.general && (
                <div className="bg-[#fff1f2] border border-[#f3c3c7] rounded-[10px] px-[12px] py-[10px]">
                  <p className="text-[#c53a45] text-[12px]">{errors.general}</p>
                </div>
              )}

              {/* Employee / Doctor ID */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="employee-id"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  {role === 'Doctor' ? 'Email or Doctor ID' : 'Employee ID'}
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
                  className={inputBase}
                />

                {errors.employeeId && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.employeeId}
                  </p>
                )}

              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="staff-password"
                  className="font-semibold text-[#142033] text-[13px]"
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
                  className={inputBase}
                />

                {errors.password && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">

                <label className="flex items-center gap-[8px] cursor-pointer">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[14px] h-[14px] accent-[#155ead] cursor-pointer"
                  />

                  <span className="text-[#526176] text-[12px]">
                    Remember me
                  </span>

                </label>

                <button
                  type="button"
                  className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
                >
                  Forgot password?
                </button>

              </div>

              {/* Sign In */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center py-[12px]"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

            </form>

          </div>

          {/* Patient Login / Registration */}
          <div className="mt-[16px] bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] text-center shadow-[0px_2px_12px_0px_rgba(19,36,58,0.04)]">

            <p className="font-semibold text-[#142033] text-[13px]">
              Are you a patient?
            </p>

            <p className="text-[#7b899c] text-[12px] mt-[4px]">
              Login or create an account to manage your OPD appointments.
            </p>

            {/* Patient Login */}
            <Button
              variant="primary"
              onClick={() => navigate('/patient/login')}
              className="w-full justify-center mt-[12px] py-[10px]"
            >
              Patient Login →
            </Button>

            {/* Patient Register */}
            <button
              type="button"
              onClick={() => navigate('/patient/register')}
              className="w-full mt-[10px] py-[10px] rounded-[9px] border border-[#155ead] text-[#155ead] font-semibold text-[13px] cursor-pointer hover:bg-[#f4f8fd] transition-colors"
            >
              Create Patient Account
            </button>

          </div>

          {/* Guest Booking */}
          <div className="mt-[16px] bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] text-center shadow-[0px_2px_12px_0px_rgba(19,36,58,0.04)]">

            <p className="font-semibold text-[#142033] text-[13px]">
              Don't want to register?
            </p>

            <p className="text-[#7b899c] text-[12px] mt-[4px]">
              You can still book an OPD appointment as a guest.
            </p>

            <Button
              variant="success"
              onClick={() => navigate('/patient')}
              className="w-full justify-center mt-[12px] py-[10px]"
            >
              Continue as Guest →
            </Button>

          </div>

        </div>

      </div>

    </div>
  );
}