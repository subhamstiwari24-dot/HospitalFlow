import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const inputBase = 'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] outline-none focus:border-[#155ead] w-full';

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setMessage('Enter a valid email address'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/patients/forgot-password/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) });
      const data = await response.json();
      setMessage(data.message);
      setDevOtp(data.devOtp || '');
      setStep(2);
    } catch { setMessage('Unable to connect to the server.'); } finally { setLoading(false); }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) { setMessage('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/patients/forgot-password/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), otp }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.message || 'Invalid or expired OTP'); return; }
      setResetToken(data.resetToken); setMessage('OTP verified. Choose a new password.'); setStep(3);
    } catch { setMessage('Unable to connect to the server.'); } finally { setLoading(false); }
  };

  const resetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) { setMessage('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setMessage('Passwords do not match'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/patients/forgot-password/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), resetToken, newPassword: password }) });
      const data = await response.json();
      if (!response.ok) { setMessage(data.message || 'Password reset failed'); return; }
      setMessage('Password updated successfully.');
      setTimeout(() => navigate('/patient/login'), 700);
    } catch { setMessage('Unable to connect to the server.'); } finally { setLoading(false); }
  };

  return <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-[24px] py-[48px]">
    <div className="w-full max-w-[440px]">
      <div className="text-center mb-[28px]"><img src="/assets/logo.png" alt="HospitalFlow" className="h-[64px] mx-auto object-contain" /><h1 className="font-bold text-[#142033] text-[24px] mt-[18px]">Reset your password</h1><p className="text-[#526176] text-[14px] mt-[7px]">{step === 1 ? 'We will send a verification code to your email.' : step === 2 ? 'Verify the code before choosing a new password.' : 'Choose a new password for your account.'}</p></div>
      <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
        {message && <div className="bg-[#edf8f3] border border-[#b9e4ce] rounded-[10px] px-[12px] py-[10px] mb-[16px]"><p className="text-[#18865b] text-[12px]">{message}</p></div>}
        {devOtp && <p className="text-[#18865b] text-[12px] mb-[12px]">Development OTP: {devOtp}</p>}
        {step === 1 && <form onSubmit={requestOtp} className="flex flex-col gap-[14px]"><label className="font-semibold text-[#142033] text-[13px]" htmlFor="reset-email">Email Address</label><input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputBase} placeholder="Enter your email" /><Button variant="primary" type="submit" disabled={loading} className="w-full justify-center py-[12px]">{loading ? 'Sending...' : 'Send OTP'}</Button></form>}
        {step === 2 && <form onSubmit={verifyOtp} className="flex flex-col gap-[14px]"><input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} className={inputBase} placeholder="6-digit OTP" /><Button variant="primary" type="submit" disabled={loading} className="w-full justify-center py-[12px]">{loading ? 'Verifying...' : 'Verify OTP'}</Button><button type="button" onClick={() => setStep(1)} className="font-semibold text-[#155ead] text-[12px]">Use a different email</button></form>}
        {step === 3 && <form onSubmit={resetPassword} className="flex flex-col gap-[14px]"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputBase} placeholder="New password" /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputBase} placeholder="Confirm new password" /><Button variant="primary" type="submit" disabled={loading} className="w-full justify-center py-[12px]">{loading ? 'Updating...' : 'Update Password'}</Button></form>}
        <button type="button" onClick={() => navigate('/patient/login')} className="w-full font-semibold text-[#155ead] text-[12px] mt-[20px]">Back to Patient Login</button>
      </div>
    </div>
  </div>;
}
