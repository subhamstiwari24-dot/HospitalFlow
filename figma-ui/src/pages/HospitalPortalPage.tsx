import { useNavigate } from 'react-router-dom';

export default function HospitalPortalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-[#d8e1ec]">
        <div className="max-w-[1100px] mx-auto px-[24px] h-[68px] flex items-center justify-between">

          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[38px] w-auto object-contain"
          />

          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-[#526176] font-semibold text-[14px] hover:text-[#155ead] transition"
          >
            ← Back
          </button>

        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-[24px] py-[60px]">

        <div className="w-full max-w-[1100px]">

          {/* Heading */}
          <div className="text-center mb-[44px]">

            <div className="flex justify-center mb-[20px]">
              <div className="w-[72px] h-[72px] rounded-[18px] bg-[#eaf3ff] flex items-center justify-center text-[36px]">
                🏥
              </div>
            </div>

            <h1 className="font-bold text-[#142033] text-[30px] sm:text-[36px]">
              Hospital Portal
            </h1>

            <p className="text-[#526176] text-[15px] mt-[10px]">
              Choose the hospital service you want to access
            </p>

          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">

            {/* Hospital Staff */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[32px] text-left shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] hover:border-[#155ead] hover:shadow-[0px_8px_26px_0px_rgba(21,94,173,0.12)] transition-all cursor-pointer"
            >

              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#eaf3ff] flex items-center justify-center text-[32px] mb-[24px]">
                👨‍⚕️
              </div>

              <h2 className="font-bold text-[#142033] text-[21px]">
                Hospital Staff
              </h2>

              <p className="text-[#66758a] text-[14px] leading-[1.6] mt-[9px]">
                Login as a doctor or staff administrator to
                manage hospital operations and OPD activities.
              </p>

              <div className="mt-[26px] text-[#155ead] font-semibold text-[14px]">
                Continue to Staff Login →
              </div>

            </button>

            {/* Hospital Admin */}
            <button
              type="button"
              onClick={() => navigate('/hospital-admin/login')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[32px] text-left shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] hover:border-[#159570] hover:shadow-[0px_8px_26px_0px_rgba(21,149,112,0.12)] transition-all cursor-pointer"
            >

              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#e9f8f2] flex items-center justify-center text-[32px] mb-[24px]">
                👨‍💼
              </div>

              <h2 className="font-bold text-[#142033] text-[21px]">
                Hospital Admin
              </h2>

              <p className="text-[#66758a] text-[14px] leading-[1.6] mt-[9px]">
                Manage your hospital's doctors, departments,
                appointments and daily operations.
              </p>

              <div className="mt-[26px] text-[#159570] font-semibold text-[14px]">
                Continue as Hospital Admin →
              </div>

            </button>

            {/* Register Hospital */}
            <button
              type="button"
              onClick={() => navigate('/hospital/register')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[32px] text-left shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] hover:border-[#d47c0b] hover:shadow-[0px_8px_26px_0px_rgba(212,124,11,0.12)] transition-all cursor-pointer"
            >

              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#fff4df] flex items-center justify-center text-[32px] mb-[24px]">
                🏨
              </div>

              <h2 className="font-bold text-[#142033] text-[21px]">
                Register Hospital
              </h2>

              <p className="text-[#66758a] text-[14px] leading-[1.6] mt-[9px]">
                Register a new hospital with HospitalFlow
                and start managing digital OPD operations.
              </p>

              <div className="mt-[26px] text-[#d47c0b] font-semibold text-[14px]">
                Register Your Hospital →
              </div>

            </button>

          </div>

        </div>

      </main>

    </div>
  );
}