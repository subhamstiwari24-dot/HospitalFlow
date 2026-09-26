import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function PatientRegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    fullName?: string;
    age?: string;
    phone?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState('');

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
        nextErrors.age = 'Age must be at least 1 year';
      } else if (numericAge > 120) {
        nextErrors.age = 'Please enter a valid age';
      }
    }

    // Mobile Number
    if (!phone.trim()) {
      nextErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(phone.trim())) {
      nextErrors.phone =
        'Mobile number must be exactly 10 digits';
    }

    // Email
    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      nextErrors.email =
        'Enter a valid email address';
    }

    // Password
    if (!password.trim()) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password =
        'Password must be at least 6 characters';
    }

    // Confirm Password
    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword =
        'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword =
        'Passwords do not match';
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

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
            'Content-Type': 'application/json',
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

      setDevOtp(data?.devOtp || '');
      setRegistrationStep(2);
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

  const handleVerifyRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ general: 'Enter the 6-digit OTP' });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/patients/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors({ general: data?.message || 'Invalid or expired OTP' });
        return;
      }
      alert(`Account created. Your Patient ID is ${data.patientId}`);
      navigate('/patient/login');
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
      <div className="flex-1 flex items-center justify-center px-[24px] py-[40px]">

        <div className="w-full max-w-[480px]">

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
              Create Patient Account
            </h1>

            <p className="font-normal text-[#526176] text-[14px] mt-[7px]">
              Create your account to manage appointments, tokens, and OPD history.
            </p>

          </div>

          {/* Register Card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">

            {registrationStep === 2 ? (
              <form onSubmit={handleVerifyRegistration} className="flex flex-col gap-[15px]">
                {errors.general && <div className="bg-[#fff1f2] border border-[#f3c3c7] rounded-[10px] px-[12px] py-[10px]"><p className="text-[#c53a45] text-[12px]">{errors.general}</p></div>}
                <p className="text-[#526176] text-[13px]">Enter the 6-digit code sent to {email}.</p>
                {devOtp && <p className="text-[#18865b] text-[12px]">Development OTP: {devOtp}</p>}
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="Enter OTP" className={inputBase} />
                <Button variant="primary" type="submit" disabled={isLoading} className="w-full justify-center py-[12px]">{isLoading ? 'Verifying...' : 'Verify Email'}</Button>
                <button type="button" onClick={() => setRegistrationStep(1)} className="font-semibold text-[#155ead] text-[12px]">Back to registration</button>
              </form>
            ) : (
            <form
              onSubmit={handleRegister}
              className="flex flex-col gap-[15px]"
            >

              {/* General Error */}
              {errors.general && (
                <div className="bg-[#fff1f2] border border-[#f3c3c7] rounded-[10px] px-[12px] py-[10px]">
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Full Name */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-full-name"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Full Name
                </label>

                <input
                  id="patient-full-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      fullName: '',
                      general: '',
                    }));
                  }}
                  placeholder="Enter your full name"
                  className={inputBase}
                />

                {errors.fullName && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.fullName}
                  </p>
                )}

              </div>

              {/* Age */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-age"
                  className="font-semibold text-[#142033] text-[13px]"
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
                    setAge(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      age: '',
                      general: '',
                    }));
                  }}
                  placeholder="Enter your age"
                  className={inputBase}
                />

                {errors.age && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.age}
                  </p>
                )}

              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-register-phone"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Mobile Number
                </label>

                <input
                  id="patient-register-phone"
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

              {/* Email */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-email"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Email Address
                </label>

                <input
                  id="patient-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      email: '',
                      general: '',
                    }));
                  }}
                  placeholder="Enter your email"
                  className={inputBase}
                />

                {errors.email && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.email}
                  </p>
                )}

              </div>

              {/* Password */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-register-password"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Password
                </label>

                <input
                  id="patient-register-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      password: '',
                      general: '',
                    }));
                  }}
                  placeholder="Create a password"
                  className={inputBase}
                />

                {errors.password && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-[6px]">

                <label
                  htmlFor="patient-confirm-password"
                  className="font-semibold text-[#142033] text-[13px]"
                >
                  Confirm Password
                </label>

                <input
                  id="patient-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);

                    setErrors((current) => ({
                      ...current,
                      confirmPassword: '',
                      general: '',
                    }));
                  }}
                  placeholder="Confirm your password"
                  className={inputBase}
                />

                {errors.confirmPassword && (
                  <p className="text-[#c53a45] text-[12px]">
                    {errors.confirmPassword}
                  </p>
                )}

              </div>

              {/* Create Account */}
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="w-full justify-center py-[12px] mt-[4px]"
              >
                {isLoading
                  ? 'Creating Account...'
                  : 'Create Account'}
              </Button>

            </form>
            )}

            {/* Login */}
            <div className="border-t border-[#d8e1ec] mt-[24px] pt-[20px] text-center">

              <p className="text-[#7b899c] text-[13px]">
                Already have an account?
              </p>

              <button
                onClick={() => navigate('/patient/login')}
                className="font-bold text-[#155ead] text-[13px] mt-[5px] cursor-pointer hover:opacity-80"
              >
                Patient Login
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}