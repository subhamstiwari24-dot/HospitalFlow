import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function PatientLoginPage() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

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

      /*
       * Save logged-in patient information
       * for the current browser session.
       */
      sessionStorage.setItem(
        'hospitalflow_patient',
        JSON.stringify({
          patientId: data.patientId,
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
        })
      );

      alert('Login successful!');

      /*
       * Logged-in patient goes to dashboard.
       */
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
    'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-[#d8e1ec]">

        <div className="max-w-[1100px] mx-auto px-[24px] h-[60px] flex items-center justify-between">

          <button
            onClick={() => navigate('/patient')}
            className="cursor-pointer"
          >
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[32px] w-auto object-contain"
            />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
          >
            Staff Login →
          </button>

        </div>

      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-[24px] py-[48px]">

        <div className="w-full max-w-[440px]">

          {/* Hero */}
          <div className="text-center mb-[28px]">

            <div className="flex justify-center mb-[18px]">

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-[64px] w-auto object-contain"
              />

            </div>

            <h1 className="font-bold text-[#142033] text-[24px] leading-tight">
              Patient Login
            </h1>

            <p className="font-normal text-[#526176] text-[14px] mt-[7px]">
              Sign in to manage your OPD appointments and tokens.
            </p>

          </div>

          {/* Login Card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-[16px]"
            >

              {/* General Error */}
              {errors.general && (
                <div className="bg-[#fff1f2] border border-[#f3c3c7] rounded-[10px] px-[12px] py-[10px]">

                  <p className="text-[#c53a45] text-[12px]">
                    {errors.general}
                  </p>

                </div>
              )}

              {/* Mobile Number */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-login-phone"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Mobile Number
                </label>

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
                  className={inputBase}
                />

                {errors.phone && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.phone}
                  </p>
                )}

              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-login-password"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Password
                </label>

                <input
                  id="patient-login-password"
                  type="password"
                  value={password}
                  onChange={(e) => {

                    const value = e.target.value;

                    setPassword(value);

                    setErrors((current) => ({
                      ...current,
                      password: value.trim()
                        ? ''
                        : 'Password is required',
                      general: '',
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

              {/* Forgot Password */}
              <div className="flex justify-end">

                <button
                  type="button"
                  className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
                  onClick={() => {
                    // Forgot password will be implemented later.
                  }}
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
                {isLoading
                  ? 'Signing In...'
                  : 'Sign In →'}
              </Button>

            </form>

            {/* Register */}
            <div className="border-t border-[#d8e1ec] mt-[24px] pt-[20px] text-center">

              <p className="text-[#7b899c] text-[13px]">
                Don't have an account?
              </p>

              <button
                onClick={() =>
                  navigate('/patient/register')
                }
                className="font-bold text-[#155ead] text-[13px] mt-[5px] cursor-pointer hover:opacity-80"
              >
                Create Patient Account
              </button>

            </div>

          </div>

          {/* Guest Booking */}
          <div className="mt-[16px] bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] text-center shadow-[0px_2px_12px_0px_rgba(19,36,58,0.04)]">

            <p className="font-semibold text-[#142033] text-[13px]">
              Don't want to register?
            </p>

            <button
              onClick={() => navigate('/patient')}
              className="font-bold text-[#18865b] text-[13px] mt-[5px] cursor-pointer hover:opacity-80"
            >
              Continue as Guest →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}