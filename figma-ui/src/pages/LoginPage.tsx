import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'Doctor' | 'Admin'>('Doctor');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'Doctor') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="mb-[32px]">
          <img src="/assets/logo.png" alt="HospitalFlow" className="h-[52px] w-auto object-contain" />
        </div>

        <div className="bg-white border border-[#d8e1ec] rounded-[16px] p-[36px] shadow-[0px_4px_24px_0px_rgba(19,36,58,0.07)]">
          <div className="mb-[28px]">
            <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">Welcome back</h1>
            <p className="font-normal text-[#526176] text-[14px]">Sign in to your HospitalFlow account</p>
          </div>

          {/* Role selector */}
          <div className="flex gap-[8px] mb-[24px] bg-[#f4f7fb] p-[4px] rounded-[10px]">
            {(['Doctor', 'Admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-[9px] rounded-[8px] text-[13px] font-bold transition-colors cursor-pointer ${
                  role === r
                    ? 'bg-white text-[#142033] shadow-[0px_1px_4px_0px_rgba(19,36,58,0.1)]'
                    : 'text-[#7b899c] hover:text-[#526176]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-[16px]">
            <div className="flex flex-col gap-[6px]">
              <label className="font-semibold text-[#142033] text-[13px]">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder={role === 'Doctor' ? 'e.g. DR-2045' : 'e.g. AD-1001'}
                className="bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-[6px]">
              <label className="font-semibold text-[#142033] text-[13px]">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[11px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-[8px] cursor-pointer">
                <input type="checkbox" className="rounded border-[#d8e1ec]" />
                <span className="font-normal text-[#526176] text-[13px]">Remember me</span>
              </label>
              <button type="button" className="font-semibold text-[#155ead] text-[13px] cursor-pointer">Forgot password?</button>
            </div>

            <Button variant="primary" type="submit" className="w-full justify-center py-[12px] mt-[4px]">
              Sign in
            </Button>
          </form>

          <p className="text-center font-normal text-[#7b899c] text-[12px] mt-[24px]">
            North Campus · HospitalFlow v2.4
          </p>
        </div>

        {/* Patient Portal CTA */}
        <div className="mt-[20px] bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_2px_12px_0px_rgba(19,36,58,0.05)]">
          <div className="flex items-center justify-between gap-[16px]">
            <div>
              <p className="font-bold text-[#142033] text-[14px] mb-[3px]">Patient? Book an OPD</p>
              <p className="font-normal text-[#7b899c] text-[12px]">No registration needed · Instant token</p>
            </div>
            <Button variant="success" onClick={() => navigate('/patient')}>
              Book Now →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
