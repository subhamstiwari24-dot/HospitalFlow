import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

export default function HospitalRegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    officialEmail: '',
    contactNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    authorizedPersonName: '',
    designation: '',
    adminEmail: '',
    mobileNumber: '',
    preferredAdminUsername: '',
    verificationDocument: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // ---------------------------------------
  // HANDLE INPUT
  // ---------------------------------------

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/hospital-registrations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to submit hospital registration.',
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit hospital registration.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // SUCCESS SCREEN
  // =======================================

  if (success) {
    return (
      <div className="min-h-screen bg-[#031326] text-white relative overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 pointer-events-none">

          <div
            className="
              absolute
              top-[-180px]
              left-[-150px]
              w-[450px]
              h-[450px]
              rounded-full
              bg-cyan-400/10
              blur-[120px]
            "
          />

          <div
            className="
              absolute
              right-[-180px]
              bottom-[-180px]
              w-[500px]
              h-[500px]
              rounded-full
              bg-blue-500/10
              blur-[120px]
            "
          />

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

        <header
          className="
            relative
            z-10
            h-[76px]
            border-b
            border-white/10
            bg-[#031326]/75
            backdrop-blur-xl
          "
        >
          <div
            className="
              max-w-[1180px]
              mx-auto
              h-full
              px-5
              sm:px-8
              flex
              items-center
              justify-between
            "
          >

            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3"
            >

              <div
                className="
                  w-[42px]
                  h-[42px]
                  rounded-[12px]
                  bg-white/[0.07]
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  overflow-hidden
                "
              >
                <img
                  src="/assets/logo.png"
                  alt="HospitalFlow"
                  className="w-[34px]"
                />
              </div>

              <div className="text-left">

                <div className="font-bold text-[17px]">
                  Hospital
                  <span className="text-[#16d9e3]">
                    Flow
                  </span>
                </div>

                <div
                  className="
                    text-[9px]
                    text-slate-500
                    uppercase
                    tracking-[0.12em]
                  "
                >
                  Smart OPD Platform
                </div>

              </div>

            </button>

          </div>
        </header>

        {/* Success */}

        <main
          className="
            relative
            z-10
            min-h-[calc(100vh-76px)]
            flex
            items-center
            justify-center
            px-5
            py-12
          "
        >

          <div
            className="
              relative
              w-full
              max-w-[650px]
              rounded-[24px]
              p-[1px]
              bg-gradient-to-br
              from-[#16d9e3]/40
              via-white/10
              to-transparent
            "
          >

            <div
              className="
                rounded-[23px]
                bg-[#071b31]/95
                border
                border-white/[0.07]
                p-8
                sm:p-10
                text-center
                backdrop-blur-xl
              "
            >

              {/* Success icon */}

              <div
                className="
                  mx-auto
                  w-[76px]
                  h-[76px]
                  rounded-full
                  bg-[#16d9e3]/10
                  border
                  border-[#16d9e3]/20
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_35px_rgba(22,217,227,0.12)]
                "
              >
                <span
                  className="
                    text-[#16d9e3]
                    text-[32px]
                    font-bold
                  "
                >
                  ✓
                </span>
              </div>

              <h1
                className="
                  mt-6
                  text-[28px]
                  sm:text-[32px]
                  font-bold
                "
              >
                Registration Submitted
              </h1>

              <p
                className="
                  mt-3
                  text-slate-400
                  text-[14px]
                  sm:text-[15px]
                  leading-[1.7]
                "
              >
                Your hospital registration has been
                submitted successfully.
                Our Super Admin team will review
                your application.
              </p>

              {/* Status */}

              <div
                className="
                  mt-6
                  rounded-[14px]
                  bg-[#16d9e3]/[0.06]
                  border
                  border-[#16d9e3]/15
                  p-5
                  text-left
                "
              >

                <div className="flex items-center gap-3">

                  <div
                    className="
                      w-9
                      h-9
                      rounded-[10px]
                      bg-[#16d9e3]/10
                      flex
                      items-center
                      justify-center
                      text-[#16d9e3]
                    "
                  >
                    01
                  </div>

                  <div>

                    <p
                      className="
                        text-[12px]
                        text-slate-500
                        uppercase
                        tracking-wide
                      "
                    >
                      Application Status
                    </p>

                    <p
                      className="
                        text-[#8ef8ff]
                        font-bold
                        text-[15px]
                        mt-0.5
                      "
                    >
                      Pending Review
                    </p>

                  </div>

                </div>

                <p
                  className="
                    text-slate-400
                    text-[12px]
                    leading-[1.6]
                    mt-4
                  "
                >
                  You will be able to access the
                  Hospital Admin portal after your
                  hospital is approved.
                </p>

              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="
                  mt-7
                  w-full
                  bg-[#16d9e3]
                  hover:bg-[#5deaf0]
                  text-[#031326]
                  rounded-[12px]
                  py-3
                  font-bold
                  text-[14px]
                  transition-all
                  shadow-[0_8px_25px_rgba(22,217,227,0.14)]
                "
              >
                Back to HospitalFlow
              </button>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // =======================================
  // REGISTRATION PAGE
  // =======================================

  return (
    <div
      className="
        min-h-screen
        bg-[#031326]
        text-white
        relative
        overflow-hidden
      "
    >

      {/* =====================================
          BACKGROUND
      ===================================== */}

      <div
        className="
          fixed
          inset-0
          pointer-events-none
          overflow-hidden
        "
      >

        <div
          className="
            absolute
            top-[-180px]
            left-[-160px]
            w-[500px]
            h-[500px]
            rounded-full
            bg-cyan-400/10
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            top-[35%]
            right-[-220px]
            w-[550px]
            h-[550px]
            rounded-full
            bg-blue-500/10
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            bottom-[-250px]
            left-[25%]
            w-[600px]
            h-[450px]
            rounded-full
            bg-cyan-400/5
            blur-[130px]
          "
        />

        {/* Grid */}

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '45px 45px',
          }}
        />

      </div>

      {/* =====================================
          HEADER
      ===================================== */}

      <header
        className="
          relative
          z-10
          h-[76px]
          border-b
          border-white/10
          bg-[#031326]/75
          backdrop-blur-xl
        "
      >

        <div
          className="
            max-w-[1180px]
            mx-auto
            h-full
            px-5
            sm:px-8
            flex
            items-center
            justify-between
          "
        >

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
          >

            <div
              className="
                w-[42px]
                h-[42px]
                rounded-[12px]
                bg-white/[0.07]
                border
                border-white/10
                flex
                items-center
                justify-center
                overflow-hidden
              "
            >

              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="w-[34px]"
              />

            </div>

            <div className="text-left">

              <div
                className="
                  font-bold
                  text-[17px]
                  tracking-tight
                "
              >
                Hospital
                <span className="text-[#16d9e3]">
                  Flow
                </span>
              </div>

              <div
                className="
                  text-[9px]
                  text-slate-500
                  uppercase
                  tracking-[0.12em]
                "
              >
                Smart OPD Platform
              </div>

            </div>

          </button>

          {/* Back */}

          <button
            type="button"
            onClick={() =>
              navigate('/role-selection')
            }
            className="
              text-[12px]
              sm:text-[13px]
              font-semibold
              text-slate-400
              hover:text-[#16d9e3]
              transition-colors
            "
          >
            ← Back
          </button>

        </div>

      </header>

      {/* =====================================
          MAIN
      ===================================== */}

      <main
        className="
          relative
          z-10
          px-5
          sm:px-8
          py-12
          sm:py-16
        "
      >

        <div className="max-w-[980px] mx-auto">

          {/* =================================
              PAGE HEADING
          ================================= */}

          <div className="text-center mb-10">

            {/* Icon */}

            <div
              className="
                relative
                inline-flex
                items-center
                justify-center
                mb-5
              "
            >

              <div
                className="
                  absolute
                  w-[120px]
                  h-[120px]
                  rounded-full
                  bg-cyan-400/10
                  blur-[30px]
                "
              />

              <div
                className="
                  relative
                  w-[82px]
                  h-[82px]
                  rounded-[24px]
                  bg-white/[0.07]
                  border
                  border-white/10
                  flex
                  items-center
                  justify-center
                  shadow-[0_0_45px_rgba(22,217,227,0.12)]
                "
              >

                <span
                  className="
                    text-[35px]
                  "
                >
                  🏥
                </span>

              </div>

            </div>

            {/* Badge */}

            <div className="flex justify-center mb-4">

              <span
                className="
                  inline-flex
                  px-4
                  py-2
                  rounded-full
                  bg-[#16d9e3]/10
                  border
                  border-[#16d9e3]/20
                  text-[#8ef8ff]
                  text-[11px]
                  font-medium
                "
              >
                Hospital Onboarding
              </span>

            </div>

            <h1
              className="
                text-[30px]
                sm:text-[36px]
                font-bold
                tracking-tight
              "
            >
              Register Your{' '}
              <span className="text-[#16d9e3]">
                Hospital
              </span>
            </h1>

            <p
              className="
                text-[14px]
                sm:text-[15px]
                text-slate-400
                mt-3
              "
            >
              Submit your hospital details to join
              the HospitalFlow network.
            </p>

          </div>

          {/* =================================
              FORM
          ================================= */}

          <form
            onSubmit={handleSubmit}
            className="
              relative
              rounded-[26px]
              p-[1px]
              bg-gradient-to-br
              from-[#16d9e3]/30
              via-white/10
              to-transparent
            "
          >

            <div
              className="
                rounded-[25px]
                bg-[#071b31]/95
                border
                border-white/[0.07]
                p-6
                sm:p-8
                lg:p-10
                backdrop-blur-xl
              "
            >

              {/* Error */}

              {error && (
                <div
                  className="
                    mb-8
                    rounded-[13px]
                    border
                    border-red-400/20
                    bg-red-400/10
                    px-4
                    py-3
                  "
                >
                  <p
                    className="
                      text-red-300
                      text-[12px]
                      leading-[1.5]
                    "
                  >
                    {error}
                  </p>
                </div>
              )}

              {/* =================================
                  SECTION 01
              ================================= */}

              <FormSectionHeader
                number="01"
                title="Hospital Information"
                description="Provide the official information of your hospital."
              />

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <InputField
                  label="Hospital Name"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  placeholder="ABC Multispeciality Hospital"
                />

                <InputField
                  label="Registration / License Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  required
                  placeholder="MH-HOSP-12345"
                />

                <InputField
                  label="Official Email"
                  name="officialEmail"
                  type="email"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  required
                  placeholder="hospital@example.com"
                />

                <InputField
                  label="Contact Number"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                />

                <InputField
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  placeholder="Mumbai"
                />

                <InputField
                  label="State"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  placeholder="Maharashtra"
                />

                <InputField
                  label="Pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  placeholder="400001"
                />

              </div>

              {/* Address */}

              <div className="mt-5">

                <TextareaField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Complete hospital address"
                />

              </div>

              {/* Description */}

              <div className="mt-5">

                <TextareaField
                  label="Hospital Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of your hospital"
                />

              </div>

              {/* Divider */}

              <SectionDivider />

              {/* =================================
                  SECTION 02
              ================================= */}

              <FormSectionHeader
                number="02"
                title="Authorized Person"
                description="Details of the person authorized to register this hospital."
              />

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <InputField
                  label="Authorized Person Name"
                  name="authorizedPersonName"
                  value={formData.authorizedPersonName}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                />

                <InputField
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  placeholder="Hospital Director"
                />

                <InputField
                  label="Admin Email"
                  name="adminEmail"
                  type="email"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  required
                  placeholder="admin@hospital.com"
                />

                <InputField
                  label="Mobile Number"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  required
                  placeholder="+91 9876543210"
                />

                <InputField
                  label="Preferred Admin Username"
                  name="preferredAdminUsername"
                  value={formData.preferredAdminUsername}
                  onChange={handleChange}
                  required
                  placeholder="hospitaladmin"
                />

              </div>

              {/* Divider */}

              <SectionDivider />

              {/* =================================
                  SECTION 03
              ================================= */}

              <FormSectionHeader
                number="03"
                title="Verification"
                description="Add your registration or verification document reference."
              />

              <InputField
                label="Verification Document"
                name="verificationDocument"
                value={formData.verificationDocument}
                onChange={handleChange}
                placeholder="Document name or reference"
              />

              {/* Pending info */}

              <div
                className="
                  mt-5
                  rounded-[14px]
                  bg-[#16d9e3]/[0.05]
                  border
                  border-[#16d9e3]/15
                  p-4
                "
              >

                <div className="flex gap-3">

                  <div
                    className="
                      flex-shrink-0
                      w-8
                      h-8
                      rounded-[9px]
                      bg-[#16d9e3]/10
                      flex
                      items-center
                      justify-center
                      text-[#16d9e3]
                      text-[12px]
                      font-bold
                    "
                  >
                    i
                  </div>

                  <p
                    className="
                      text-slate-400
                      text-[12px]
                      leading-[1.7]
                    "
                  >
                    Your registration will remain{' '}
                    <strong className="text-[#8ef8ff]">
                      PENDING
                    </strong>{' '}
                    until it is reviewed by the
                    HospitalFlow Super Admin.
                  </p>

                </div>

              </div>

              {/* =================================
                  SUBMIT
              ================================= */}

              <div
                className="
                  mt-9
                  pt-7
                  border-t
                  border-white/[0.07]
                "
              >

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    bg-[#16d9e3]
                    hover:bg-[#5deaf0]
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                    text-[#031326]
                    rounded-[13px]
                    py-3.5
                    font-bold
                    text-[14px]
                    transition-all
                    shadow-[0_8px_28px_rgba(22,217,227,0.14)]
                  "
                >
                  {loading
                    ? 'Submitting Registration...'
                    : 'Submit Hospital Registration'}
                </button>

                <p
                  className="
                    text-center
                    text-[11px]
                    text-slate-600
                    mt-3
                  "
                >
                  By submitting, your hospital will
                  enter the HospitalFlow review process.
                </p>

              </div>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

// ===========================================
// SECTION HEADER
// ===========================================

type FormSectionHeaderProps = {
  number: string;
  title: string;
  description: string;
};

function FormSectionHeader({
  number,
  title,
  description,
}: FormSectionHeaderProps) {
  return (
    <div className="flex items-start gap-4 mb-6">

      <div
        className="
          flex-shrink-0
          w-10
          h-10
          rounded-[12px]
          bg-[#16d9e3]/10
          border
          border-[#16d9e3]/20
          flex
          items-center
          justify-center
          text-[#16d9e3]
          text-[12px]
          font-bold
        "
      >
        {number}
      </div>

      <div>

        <h2
          className="
            text-[19px]
            sm:text-[20px]
            font-bold
            text-white
          "
        >
          {title}
        </h2>

        <p
          className="
            text-[12px]
            sm:text-[13px]
            text-slate-500
            mt-1
            leading-[1.5]
          "
        >
          {description}
        </p>

      </div>

    </div>
  );
}

// ===========================================
// DIVIDER
// ===========================================

function SectionDivider() {
  return (
    <div
      className="
        my-9
        border-t
        border-white/[0.07]
      "
    />
  );
}

// ===========================================
// INPUT
// ===========================================

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
}: InputFieldProps) {
  return (
    <div>

      <label
        className="
          block
          text-slate-300
          font-semibold
          text-[12px]
          mb-2
        "
      >
        {label}

        {required && (
          <span className="text-[#16d9e3] ml-1">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="
          w-full
          bg-white/[0.045]
          border
          border-white/10
          rounded-[12px]
          px-4
          py-3
          text-[13px]
          text-white
          placeholder:text-slate-600
          outline-none
          focus:border-[#16d9e3]
          focus:ring-2
          focus:ring-[#16d9e3]/10
          transition-all
        "
      />

    </div>
  );
}

// ===========================================
// TEXTAREA
// ===========================================

type TextareaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  rows?: number;
  placeholder?: string;
  required?: boolean;
};

function TextareaField({
  label,
  name,
  value,
  onChange,
  rows = 3,
  placeholder,
  required = false,
}: TextareaFieldProps) {
  return (
    <div>

      <label
        className="
          block
          text-slate-300
          font-semibold
          text-[12px]
          mb-2
        "
      >
        {label}

        {required && (
          <span className="text-[#16d9e3] ml-1">
            *
          </span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        placeholder={placeholder}
        className="
          w-full
          bg-white/[0.045]
          border
          border-white/10
          rounded-[12px]
          px-4
          py-3
          text-[13px]
          text-white
          placeholder:text-slate-600
          outline-none
          focus:border-[#16d9e3]
          focus:ring-2
          focus:ring-[#16d9e3]/10
          transition-all
          resize-none
        "
      />

    </div>
  );
}