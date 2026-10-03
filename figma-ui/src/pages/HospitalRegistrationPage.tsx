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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Unable to submit hospital registration.'
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit hospital registration.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
        <header className="bg-white border-b border-[#d8e1ec]">
          <div className="max-w-[1100px] mx-auto px-[24px] h-[68px] flex items-center justify-center">
            <img
              src="/assets/logo.png"
              alt="HospitalFlow"
              className="h-[38px] w-auto object-contain"
            />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-[24px] py-[60px]">
          <div className="w-full max-w-[650px] bg-white border border-[#d8e1ec] rounded-[20px] p-[40px] text-center shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)]">

            <div className="mx-auto w-[72px] h-[72px] rounded-full bg-[#e8f8f2] flex items-center justify-center text-[34px]">
              ✓
            </div>

            <h1 className="mt-[24px] text-[#142033] font-bold text-[28px]">
              Registration Submitted
            </h1>

            <p className="mt-[12px] text-[#526176] text-[15px] leading-[1.7]">
              Your hospital registration has been submitted successfully.
              Our Super Admin team will review your application.
            </p>

            <div className="mt-[24px] rounded-[12px] bg-[#fff8e8] border border-[#f1d89a] p-[16px] text-left">
              <p className="text-[#7a5a13] text-[14px] leading-[1.6]">
                <strong>Status:</strong> Pending Review
              </p>

              <p className="text-[#7a5a13] text-[14px] leading-[1.6] mt-[5px]">
                You will be able to access the Hospital Admin portal after
                your hospital is approved.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-[28px] bg-[#155ead] text-white px-[28px] py-[12px] rounded-[10px] font-semibold text-[14px] hover:bg-[#104d91] transition"
            >
              Back to HospitalFlow
            </button>

          </div>
        </main>
      </div>
    );
  }

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
      <main className="flex-1 px-[24px] py-[50px]">

        <div className="max-w-[900px] mx-auto">

          {/* Heading */}
          <div className="text-center mb-[36px]">

            <div className="flex justify-center mb-[18px]">
              <div className="w-[64px] h-[64px] rounded-[16px] bg-[#fff4df] flex items-center justify-center text-[32px]">
                🏨
              </div>
            </div>

            <h1 className="text-[#142033] font-bold text-[30px]">
              Register Your Hospital
            </h1>

            <p className="text-[#526176] text-[15px] mt-[10px]">
              Submit your hospital details to join HospitalFlow.
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white border border-[#d8e1ec] rounded-[20px] shadow-[0px_5px_20px_0px_rgba(19,36,58,0.06)] p-[28px] md:p-[40px]"
          >

            {/* Error */}
            {error && (
              <div className="mb-[28px] rounded-[10px] border border-red-200 bg-red-50 px-[16px] py-[12px] text-red-600 text-[14px]">
                {error}
              </div>
            )}

            {/* Hospital Information */}
            <section>

              <h2 className="text-[#142033] font-bold text-[20px]">
                Hospital Information
              </h2>

              <p className="text-[#66758a] text-[13px] mt-[5px] mb-[22px]">
                Provide the official information of your hospital.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">

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

              <div className="mt-[18px]">
                <label className="block text-[#142033] font-semibold text-[13px] mb-[7px]">
                  Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Complete hospital address"
                  className="w-full border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] outline-none focus:border-[#155ead] resize-none"
                />
              </div>

              <div className="mt-[18px]">
                <label className="block text-[#142033] font-semibold text-[13px] mb-[7px]">
                  Hospital Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of your hospital"
                  className="w-full border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] outline-none focus:border-[#155ead] resize-none"
                />
              </div>

            </section>

            {/* Divider */}
            <div className="my-[35px] border-t border-[#e4eaf1]" />

            {/* Authorized Person */}
            <section>

              <h2 className="text-[#142033] font-bold text-[20px]">
                Authorized Person
              </h2>

              <p className="text-[#66758a] text-[13px] mt-[5px] mb-[22px]">
                Details of the person authorized to register this hospital.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">

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

            </section>

            {/* Divider */}
            <div className="my-[35px] border-t border-[#e4eaf1]" />

            {/* Verification */}
            <section>

              <h2 className="text-[#142033] font-bold text-[20px]">
                Verification
              </h2>

              <p className="text-[#66758a] text-[13px] mt-[5px] mb-[22px]">
                Add your registration or verification document reference.
              </p>

              <InputField
                label="Verification Document"
                name="verificationDocument"
                value={formData.verificationDocument}
                onChange={handleChange}
                placeholder="Document name or reference"
              />

              <div className="mt-[14px] rounded-[10px] bg-[#f7f9fc] border border-[#e2e8f0] p-[14px]">
                <p className="text-[#66758a] text-[12px] leading-[1.6]">
                  Your registration will remain <strong>PENDING</strong> until
                  it is reviewed by the HospitalFlow Super Admin.
                </p>
              </div>

            </section>

            {/* Submit */}
            <div className="mt-[35px] pt-[25px] border-t border-[#e4eaf1]">

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#155ead] hover:bg-[#104d91] disabled:bg-[#9bb6d5] text-white rounded-[10px] py-[14px] font-semibold text-[15px] transition"
              >
                {loading
                  ? 'Submitting Registration...'
                  : 'Submit Hospital Registration'}
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

type InputFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
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
      <label className="block text-[#142033] font-semibold text-[13px] mb-[7px]">
        {label}
        {required && <span className="text-red-500 ml-[3px]">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-[#d8e1ec] rounded-[10px] px-[14px] py-[12px] text-[14px] text-[#142033] outline-none focus:border-[#155ead]"
      />
    </div>
  );
}