import { useNavigate } from 'react-router-dom';

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-[#d8e1ec]">
        <div className="max-w-[1100px] mx-auto px-[24px] h-[68px] flex items-center justify-center">
          <img
            src="/assets/logo.png"
            alt="HospitalFlow"
            className="h-[38px] w-auto object-contain"
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-[24px] py-[60px]">

        <div className="w-full max-w-[850px]">

          {/* Heading */}
          <div className="text-center mb-[44px]">

            <div className="flex justify-center mb-[20px]">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-[70px] w-auto object-contain"
              />
            </div>

            <h1 className="font-bold text-[#142033] text-[30px] leading-tight">
              Welcome to HospitalFlow
            </h1>

            <p className="text-[#526176] text-[15px] mt-[10px]">
              Choose how you want to continue
            </p>

          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">

            {/* Hospital */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[34px] text-left shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] hover:border-[#155ead] hover:shadow-[0px_8px_26px_0px_rgba(21,94,173,0.12)] transition-all cursor-pointer"
            >

              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#eaf3ff] flex items-center justify-center text-[32px] mb-[24px]">
                🏥
              </div>

              <h2 className="font-bold text-[#142033] text-[21px]">
                Hospital
              </h2>

              <p className="text-[#66758a] text-[14px] leading-[1.6] mt-[9px]">
                Login as a Doctor or Admin to manage hospital
                operations, appointments, doctors and OPD queues.
              </p>

              <div className="mt-[26px] text-[#155ead] font-semibold text-[14px] group-hover:translate-x-[3px] transition-transform">
                Continue as Hospital →
              </div>

            </button>

            {/* Patient */}
            <button
              type="button"
              onClick={() => navigate('/patient/login')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[34px] text-left shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] hover:border-[#159570] hover:shadow-[0px_8px_26px_0px_rgba(21,149,112,0.12)] transition-all cursor-pointer"
            >

              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#e8f8f2] flex items-center justify-center text-[32px] mb-[24px]">
                👤
              </div>

              <h2 className="font-bold text-[#142033] text-[21px]">
                Patient
              </h2>

              <p className="text-[#66758a] text-[14px] leading-[1.6] mt-[9px]">
                Login or create your patient account to book
                appointments, get tokens and track your OPD queue.
              </p>

              <div className="mt-[26px] text-[#159570] font-semibold text-[14px] group-hover:translate-x-[3px] transition-transform">
                Continue as Patient →
              </div>

            </button>

          </div>

          {/* Guest option */}
          <div className="text-center mt-[30px]">

            <p className="text-[#7b899c] text-[13px]">
              Don't want to create an account?
            </p>

            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="mt-[8px] text-[#155ead] font-semibold text-[13px] hover:underline cursor-pointer"
            >
              Continue as Guest →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}