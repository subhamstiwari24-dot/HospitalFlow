import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../../context/PatientContext';
import Button from '../../components/Button';

export default function PatientEntryPage() {
  const navigate = useNavigate();
  const { setPatientIdentity } = usePatient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Please enter your name';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a valid 10-digit mobile number';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setPatientIdentity(name.trim(), phone.trim());
    navigate('/patient/hospital');
  };

  const inputBase = 'bg-white border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[15px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full';

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#d8e1ec]">
        <div className="max-w-[1100px] mx-auto px-[24px] h-[60px] flex items-center justify-between">
          <img src="/assets/logo.png" alt="HospitalFlow" className="h-[32px] w-auto object-contain" />
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-[#155ead] text-[12px] cursor-pointer hover:opacity-80"
          >
            Staff Login →
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-[24px] py-[48px]">
        <div className="w-full max-w-[480px]">
          {/* Hero */}
          <div className="text-center mb-[36px]">
            <div className="flex justify-center mb-[20px]">
              <img src="/assets/logo.png" alt="HospitalFlow" className="h-[72px] w-auto object-contain" />
            </div>
            <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[8px]">
              Book Your OPD Appointment
            </h1>
            <p className="font-normal text-[#526176] text-[14px]">
              Search hospitals, choose your doctor, and get your token — all in one place.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] sm:p-[32px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <p className="font-bold text-[#142033] text-[16px] mb-[20px]">Enter your details</p>
            <form onSubmit={handleContinue} className="flex flex-col gap-[16px]">
              <div className="flex flex-col gap-[6px]">
                <label className="font-semibold text-[#142033] text-[13px]">Full Name <span className="text-[#c53a45]">*</span></label>
                <input
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((err) => ({ ...err, name: '' })); }}
                  placeholder="e.g. Aarav Patel"
                  className={inputBase}
                />
                {errors.name && <p className="text-[#c53a45] text-[12px]">{errors.name}</p>}
              </div>
              <div className="flex flex-col gap-[6px]">
                <label className="font-semibold text-[#142033] text-[13px]">Mobile Number <span className="text-[#c53a45]">*</span></label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors((err) => ({ ...err, phone: '' })); }}
                  placeholder="+91 98765 XXXXX"
                  className={inputBase}
                />
                {errors.phone && <p className="text-[#c53a45] text-[12px]">{errors.phone}</p>}
              </div>
              <Button variant="primary" type="submit" className="w-full justify-center py-[12px] mt-[4px]">
                Search Hospitals →
              </Button>
            </form>
          </div>

          {/* Feature pills */}
          <div className="flex gap-[10px] mt-[24px] justify-center flex-wrap">
            {['No registration needed', 'Instant token', 'Live queue tracking'].map((f) => (
              <div key={f} className="bg-white border border-[#d8e1ec] px-[12px] py-[6px] rounded-[999px] flex items-center gap-[6px]">
                <div className="size-[6px] rounded-full bg-[#18865b]" />
                <p className="font-medium text-[#526176] text-[12px]">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
