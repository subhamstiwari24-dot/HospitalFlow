import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputBase =
    'w-full rounded-[13px] border border-white/10 bg-white/[0.055] px-[14px] py-[13px] pl-[44px] text-[14px] text-white outline-none placeholder:text-slate-500 transition-all focus:border-[#16d9e3]/60 focus:bg-white/[0.075] focus:ring-2 focus:ring-[#16d9e3]/10';

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMessage('Enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        '/api/patients/forgot-password/request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      setMessage(data.message);
      setStep(2);
    } catch {
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      setMessage('Enter the 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        '/api/patients/forgot-password/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Invalid or expired OTP');
        return;
      }

      setResetToken(data.resetToken);
      setMessage('OTP verified. Choose a new password.');
      setStep(3);
    } catch {
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        '/api/patients/forgot-password/reset',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email.trim(),
            resetToken,
            newPassword: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || 'Password reset failed');
        return;
      }

      setMessage('Password updated successfully.');

      setTimeout(() => {
        navigate('/patient/login');
      }, 700);
    } catch {
      setMessage('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === 1
      ? 'Reset your password'
      : step === 2
      ? 'Verify your identity'
      : 'Create new password';

  const stepDescription =
    step === 1
      ? 'We will send a verification code to your registered email.'
      : step === 2
      ? 'Enter the 6-digit verification code sent to your email.'
      : 'Choose a strong new password for your HospitalFlow account.';

  return (
    <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <div className="absolute top-[-180px] left-[-150px] w-[420px] h-[420px] rounded-full bg-cyan-400/10 blur-[110px]" />

        <div className="absolute top-[25%] right-[-180px] w-[450px] h-[450px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="absolute bottom-[-200px] left-[30%] w-[500px] h-[400px] rounded-full bg-cyan-400/5 blur-[120px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 h-[76px] border-b border-white/10 bg-[#031326]/75 backdrop-blur-xl">
        <div className="max-w-[1180px] mx-auto h-full px-5 sm:px-8 flex items-center justify-between">

          <button
            type="button"
            onClick={() => navigate('/patient/login')}
            className="group flex items-center gap-3"
          >
            <div className="w-[42px] h-[42px] rounded-[12px] bg-white/[0.07] border border-white/10 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px] h-auto object-contain"
              />
            </div>

            <div className="text-left">
              <div className="font-bold text-[17px] tracking-tight">
                Hospital
                <span className="text-[#16d9e3]">Flow</span>
              </div>

              <div className="text-[9px] text-slate-500 tracking-[0.12em] uppercase">
                Smart OPD Platform
              </div>
            </div>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#16d9e3]" />
            Secure Account Recovery
          </div>

        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 min-h-[calc(100vh-76px)] flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-[470px]">

          {/* Top branding */}
          <div className="text-center mb-7">

            <div className="relative inline-flex items-center justify-center mb-5">

              <div className="absolute w-[100px] h-[100px] rounded-full bg-cyan-400/10 blur-[25px]" />

              <div className="relative w-[76px] h-[76px] rounded-[22px] bg-white/[0.07] border border-white/10 flex items-center justify-center shadow-[0_0_40px_rgba(22,217,227,0.12)]">
                <img
                  src="/assets/logo.png"
                  alt="HospitalFlow"
                  className="w-[58px] h-auto object-contain"
                />
              </div>

            </div>

            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16d9e3]/10 border border-[#16d9e3]/20 text-[#8ef8ff] text-[11px] font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                Account Recovery
              </div>
            </div>

            <h1 className="text-[29px] sm:text-[34px] font-bold tracking-[-0.025em]">
              {stepTitle}
            </h1>

            <p className="text-[13px] sm:text-[14px] text-slate-400 leading-[1.6] mt-2 max-w-[390px] mx-auto">
              {stepDescription}
            </p>

          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-6">

            {/* Step 1 */}
            <div className="flex items-center">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all ${
                  step >= 1
                    ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3]'
                    : 'bg-white/5 text-slate-500 border-white/10'
                }`}
              >
                {step > 1 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  '1'
                )}
              </div>

              <span
                className={`ml-2 text-[11px] font-medium ${
                  step >= 1 ? 'text-cyan-200' : 'text-slate-500'
                }`}
              >
                Email
              </span>

            </div>

            <div
              className={`w-[55px] h-[1px] mx-3 ${
                step >= 2 ? 'bg-[#16d9e3]' : 'bg-white/10'
              }`}
            />

            {/* Step 2 */}
            <div className="flex items-center">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all ${
                  step >= 2
                    ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3]'
                    : 'bg-white/5 text-slate-500 border-white/10'
                }`}
              >
                {step > 2 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  '2'
                )}
              </div>

              <span
                className={`ml-2 text-[11px] font-medium ${
                  step >= 2 ? 'text-cyan-200' : 'text-slate-500'
                }`}
              >
                Verify
              </span>

            </div>

            <div
              className={`w-[55px] h-[1px] mx-3 ${
                step >= 3 ? 'bg-[#16d9e3]' : 'bg-white/10'
              }`}
            />

            {/* Step 3 */}
            <div className="flex items-center">

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold border transition-all ${
                  step >= 3
                    ? 'bg-[#16d9e3] text-[#031326] border-[#16d9e3]'
                    : 'bg-white/5 text-slate-500 border-white/10'
                }`}
              >
                3
              </div>

              <span
                className={`ml-2 text-[11px] font-medium ${
                  step >= 3 ? 'text-cyan-200' : 'text-slate-500'
                }`}
              >
                Password
              </span>

            </div>

          </div>

          {/* Card */}
          <div className="relative rounded-[24px] p-[1px] bg-gradient-to-br from-[#16d9e3]/30 via-white/10 to-transparent shadow-[0_25px_70px_rgba(0,0,0,0.3)]">

            <div className="relative rounded-[23px] bg-[#071b31]/95 border border-white/[0.07] p-6 sm:p-8 backdrop-blur-xl">

              {/* Message */}
              {message && (
                <div
                  className={`flex items-start gap-3 rounded-[13px] px-4 py-3 mb-5 border ${
                    message.toLowerCase().includes('unable') ||
                    message.toLowerCase().includes('invalid') ||
                    message.toLowerCase().includes('failed') ||
                    message.toLowerCase().includes('must') ||
                    message.toLowerCase().includes('match')
                      ? 'bg-red-400/10 border-red-400/20'
                      : 'bg-[#16d9e3]/10 border-[#16d9e3]/20'
                  }`}
                >
                  <ShieldCheck
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      message.toLowerCase().includes('unable') ||
                      message.toLowerCase().includes('invalid') ||
                      message.toLowerCase().includes('failed') ||
                      message.toLowerCase().includes('must') ||
                      message.toLowerCase().includes('match')
                        ? 'text-red-300'
                        : 'text-[#16d9e3]'
                    }`}
                  />

                  <p className="text-[12px] leading-[1.5] text-slate-300">
                    {message}
                  </p>
                </div>
              )}

              {/* Step 1 */}
              {step === 1 && (
                <form
                  onSubmit={requestOtp}
                  className="flex flex-col gap-4"
                >

                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-[12px] font-semibold text-slate-200 mb-2"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500" />

                      <input
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputBase}
                        placeholder="Enter your registered email"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full h-[48px] rounded-[13px] bg-gradient-to-r from-[#16d9e3] to-[#0ea5e9] text-[#031326] font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(22,217,227,0.18)] hover:shadow-[0_12px_35px_rgba(22,217,227,0.28)] hover:translate-y-[-1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? (
                      'Sending OTP...'
                    ) : (
                      <>
                        Send Verification Code
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <form
                  onSubmit={verifyOtp}
                  className="flex flex-col gap-4"
                >

                  <div className="text-center mb-1">

                    <div className="mx-auto w-14 h-14 rounded-[17px] bg-[#16d9e3]/10 border border-[#16d9e3]/15 flex items-center justify-center mb-3">
                      <KeyRound className="w-7 h-7 text-[#16d9e3]" />
                    </div>

                    <p className="text-[12px] text-slate-400">
                      Verification code sent to
                    </p>

                    <p className="text-[13px] font-semibold text-cyan-200 mt-1 break-all">
                      {email}
                    </p>

                  </div>

                  <div>
                    <label
                      htmlFor="reset-otp"
                      className="block text-[12px] font-semibold text-slate-200 mb-2"
                    >
                      Verification Code
                    </label>

                    <input
                      id="reset-otp"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6)
                        )
                      }
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-[13px] border border-white/10 bg-white/[0.055] px-4 py-4 text-center text-[22px] tracking-[0.45em] font-bold text-white outline-none placeholder:text-slate-600 placeholder:tracking-normal focus:border-[#16d9e3]/60 focus:ring-2 focus:ring-[#16d9e3]/10 transition-all"
                      placeholder="000000"
                      autoComplete="one-time-code"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full h-[48px] rounded-[13px] bg-gradient-to-r from-[#16d9e3] to-[#0ea5e9] text-[#031326] font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(22,217,227,0.18)] hover:shadow-[0_12px_35px_rgba(22,217,227,0.28)] hover:translate-y-[-1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? (
                      'Verifying...'
                    ) : (
                      <>
                        Verify OTP
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setMessage('');
                      setOtp('');
                    }}
                    className="flex items-center justify-center gap-2 text-[12px] font-semibold text-cyan-300 hover:text-[#16d9e3] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Use a different email
                  </button>

                </form>
              )}

              {/* Step 3 */}
              {step === 3 && (
                <form
                  onSubmit={resetPassword}
                  className="flex flex-col gap-4"
                >

                  <div className="text-center mb-1">

                    <div className="mx-auto w-14 h-14 rounded-[17px] bg-[#16d9e3]/10 border border-[#16d9e3]/15 flex items-center justify-center mb-3">
                      <LockKeyhole className="w-7 h-7 text-[#16d9e3]" />
                    </div>

                    <p className="text-[12px] text-slate-400">
                      Create a new password for
                    </p>

                    <p className="text-[13px] font-semibold text-cyan-200 mt-1 break-all">
                      {email}
                    </p>

                  </div>

                  {/* New password */}
                  <div>
                    <label
                      htmlFor="new-password"
                      className="block text-[12px] font-semibold text-slate-200 mb-2"
                    >
                      New Password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500" />

                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`${inputBase} pr-[44px]`}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-[17px] h-[17px]" />
                        ) : (
                          <Eye className="w-[17px] h-[17px]" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            password.length >= 10
                              ? 'w-full bg-[#16d9e3]'
                              : password.length >= 6
                              ? 'w-2/3 bg-cyan-400'
                              : password.length > 0
                              ? 'w-1/3 bg-yellow-400'
                              : 'w-0'
                          }`}
                        />
                      </div>

                      <span className="text-[10px] text-slate-500">
                        {password.length >= 10
                          ? 'Strong'
                          : password.length >= 6
                          ? 'Good'
                          : password.length > 0
                          ? 'Weak'
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className="block text-[12px] font-semibold text-slate-200 mb-2"
                    >
                      Confirm Password
                    </label>

                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-slate-500" />

                      <input
                        id="confirm-password"
                        type={
                          showConfirmPassword ? 'text' : 'password'
                        }
                        value={confirmPassword}
                        onChange={(e) =>
                          setConfirmPassword(e.target.value)
                        }
                        className={`${inputBase} pr-[44px]`}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-[17px] h-[17px]" />
                        ) : (
                          <Eye className="w-[17px] h-[17px]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full h-[48px] rounded-[13px] bg-gradient-to-r from-[#16d9e3] to-[#0ea5e9] text-[#031326] font-bold text-[13px] flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(22,217,227,0.18)] hover:shadow-[0_12px_35px_rgba(22,217,227,0.28)] hover:translate-y-[-1px] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                  >
                    {loading ? (
                      'Updating Password...'
                    ) : (
                      <>
                        Update Password
                        <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>

                </form>
              )}

              {/* Back to Login */}
              <div className="mt-6 pt-5 border-t border-white/[0.07]">

                <button
                  type="button"
                  onClick={() => navigate('/patient/login')}
                  className="w-full flex items-center justify-center gap-2 text-[12px] font-semibold text-slate-400 hover:text-[#16d9e3] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Patient Login
                </button>

              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6 text-[10px] text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16d9e3]/60" />
            Your account information remains secure and private
          </div>

        </div>

      </main>
    </div>
  );
}