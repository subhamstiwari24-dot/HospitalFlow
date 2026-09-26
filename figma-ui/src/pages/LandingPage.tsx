import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
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

            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[72px] w-auto object-contain mx-auto mb-[24px]"
            />

            <h1 className="text-[#142033] font-bold text-[30px] sm:text-[36px]">
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
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[32px] text-left shadow-[0px_4px_18px_0px_rgba(19,36,58,0.05)] hover:border-[#155ead] hover:shadow-[0px_8px_24px_0px_rgba(21,94,173,0.10)] transition-all cursor-pointer"
            >

              <div className="w-[58px] h-[58px] rounded-[14px] bg-[#eaf3ff] flex items-center justify-center text-[28px] mb-[22px]">
                🏥
              </div>

              <h2 className="text-[#142033] font-bold text-[21px]">
                Hospital / Staff
              </h2>

              <p className="text-[#526176] text-[14px] leading-[1.6] mt-[8px]">
                Login as a doctor or administrator to manage
                HospitalFlow operations.
              </p>

              <div className="mt-[24px] text-[#155ead] font-semibold text-[14px]">
                Continue to Staff Login →
              </div>

            </button>


            {/* Patient */}
            <button
              type="button"
              onClick={() => navigate('/patient/login')}
              className="group bg-white border border-[#d8e1ec] rounded-[18px] p-[32px] text-left shadow-[0px_4px_18px_0px_rgba(19,36,58,0.05)] hover:border-[#159570] hover:shadow-[0px_8px_24px_0px_rgba(21,149,112,0.10)] transition-all cursor-pointer"
            >

              <div className="w-[58px] h-[58px] rounded-[14px] bg-[#e9f8f2] flex items-center justify-center text-[28px] mb-[22px]">
                👤
              </div>

              <h2 className="text-[#142033] font-bold text-[21px]">
                Patient
              </h2>

              <p className="text-[#526176] text-[14px] leading-[1.6] mt-[8px]">
                Login or create your patient account to manage
                appointments, tokens, and OPD history.
              </p>

              <div className="mt-[24px] text-[#159570] font-semibold text-[14px]">
                Continue as Patient →
              </div>

            </button>

          </div>

          {/* Guest Booking */}
          <div className="text-center mt-[28px]">

            <p className="text-[#7b899c] text-[13px]">
              Don't want to create an account?
            </p>

            <button
              type="button"
              onClick={() => navigate('/patient')}
              className="mt-[6px] text-[#159570] font-semibold text-[13px] hover:underline cursor-pointer"
            >
              Continue as Guest →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}