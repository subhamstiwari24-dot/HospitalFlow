
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8080';

type RegistrationFormData = {
  hospitalName: string;
  registrationNumber: string;
  officialEmail: string;
  contactNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  description: string;
  authorizedPersonName: string;
  designation: string;
  adminEmail: string;
  mobileNumber: string;
  preferredAdminUsername: string;
  verificationDocument: string;
};

const initialFormData: RegistrationFormData = {
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
};

type InputFieldProps = {
  label: string;
  name: keyof RegistrationFormData;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
};

function InputField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  maxLength,
}: InputFieldProps) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-[#34465e]"
      >
        {label}
        {required && <span className="ml-1 text-[#19c9d5]">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className="w-full rounded-xl border border-[#d8e4ef] bg-[#f7faff] px-4 py-3 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] hover:border-[#b7cce0] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

type TextareaFieldProps = {
  label: string;
  name: keyof RegistrationFormData;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  rows?: number;
};

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-[#34465e]"
      >
        {label}
        {required && <span className="ml-1 text-[#19c9d5]">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="w-full resize-y rounded-xl border border-[#d8e4ef] bg-[#f7faff] px-4 py-3 text-sm text-[#10213f] outline-none transition placeholder:text-[#91a2b8] hover:border-[#b7cce0] focus:border-[#19c9d5] focus:bg-white focus:ring-4 focus:ring-cyan-100"
      />
    </div>
  );
}

function SectionHeader({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e6fbfd] text-sm font-bold text-[#089eaf]">
        {number}
      </div>

      <div>
        <h2 className="text-lg font-bold text-[#10213f]">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#7890aa]">
          {description}
        </p>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="my-8 border-t border-[#e8eff6]" />;
}

export default function HospitalRegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<RegistrationFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
            (typeof data === 'string' ? data : '') ||
            'Unable to submit hospital registration.'
        );
      }

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit hospital registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f9fc] text-[#10213f]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e1eaf3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[#e1eaf3] bg-white">
              <img
                src="/assets/logo.png"
                alt="HospitalFlow"
                className="h-9 w-9 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="hidden text-xl text-[#19c9d5]">✚</span>
            </div>

            <div>
              <div className="text-lg font-extrabold tracking-tight text-[#10213f]">
                Hospital<span className="text-[#17bfce]">Flow</span>
              </div>
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#7890aa]">
                Smart OPD Platform
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/role-selection')}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-[#089eaf] transition hover:bg-[#e9fbfd]"
          >
            <span aria-hidden="true">← </span>
            Back
          </button>
        </div>
      </header>

      {/* Main page */}
      <main className="relative overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-96 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-[1000px]">
          {/* Page heading */}
          <div className="mb-9 text-center">
            <div className="mx-auto mb-5 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-[#d7f4f7] bg-white text-4xl shadow-sm">
              🏥
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c7f0f4] bg-[#e9fbfd] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#078f9f]">
              <span className="h-2 w-2 rounded-full bg-[#19c9d5]" />
              Hospital onboarding
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#10213f] sm:text-4xl">
              Register Your{' '}
              <span className="text-[#17bfce]">Hospital</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#7890aa] sm:text-base">
              Join the HospitalFlow network and manage your hospital’s OPD
              operations through one smart platform.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[#607994]">
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <span className="text-[#17bfce]">✓</span> Secure registration
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <span className="text-[#17bfce]">✓</span> Admin verification
              </span>
              <span className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                <span className="text-[#17bfce]">✓</span> Approval required
              </span>
            </div>
          </div>

          {/* Success screen */}
          {success ? (
            <div className="mx-auto max-w-[650px] rounded-3xl border border-[#dce9f3] bg-white p-7 text-center shadow-[0_18px_55px_rgba(16,33,63,0.07)] sm:p-11">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7faf1] text-3xl font-bold text-emerald-600">
                ✓
              </div>

              <h2 className="mt-6 text-2xl font-extrabold text-[#10213f]">
                Registration Submitted
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7890aa]">
                Your hospital registration has been submitted successfully.
                The HospitalFlow Super Admin will review your application.
              </p>

              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    ◷
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Application status
                    </p>
                    <p className="mt-1 font-bold text-amber-800">
                      Pending Review
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-amber-800/80">
                  You can access the Hospital Admin portal after your
                  application has been approved.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="mt-7 w-full rounded-xl bg-[#19c9d5] px-5 py-3.5 text-sm font-bold text-[#06243b] shadow-sm transition hover:bg-[#35d7e0] focus:outline-none focus:ring-4 focus:ring-cyan-100"
              >
                Back to HospitalFlow →
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-3xl border border-[#dce8f3] bg-white shadow-[0_18px_55px_rgba(16,33,63,0.07)]"
            >
              <div className="border-b border-[#e8eff6] px-6 py-5 sm:px-9">
                <h2 className="text-lg font-extrabold text-[#10213f]">
                  Hospital Registration Details
                </h2>
                <p className="mt-1 text-sm text-[#7890aa]">
                  Enter accurate details to submit your application for review.
                  Fields marked with * are required.
                </p>
              </div>

              <div className="p-6 sm:p-9">
                {error && (
                  <div
                    role="alert"
                    className="mb-7 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5"
                  >
                    <span className="mt-0.5 text-red-600">!</span>
                    <div>
                      <p className="text-sm font-bold text-red-800">
                        Registration failed
                      </p>
                      <p className="mt-1 break-words text-sm leading-6 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section 01 */}
                <section>
                  <SectionHeader
                    number="01"
                    title="Hospital Information"
                    description="Provide the official details and location of your hospital."
                  />

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
                      type="tel"
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
                      maxLength={6}
                      placeholder="400001"
                    />
                  </div>

                  <div className="mt-5">
                    <TextareaField
                      label="Hospital Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Building, street, area and complete hospital address"
                    />
                  </div>

                  <div className="mt-5">
                    <TextareaField
                      label="Hospital Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Briefly describe your hospital and services"
                    />
                  </div>
                </section>

                <Divider />

                {/* Section 02 */}
                <section>
                  <SectionHeader
                    number="02"
                    title="Authorized Person"
                    description="Provide the contact details of the person responsible for hospital administration."
                  />

                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
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
                      type="tel"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      required
                      placeholder="+91 9876543210"
                    />

                    <div className="md:col-span-2">
                      <InputField
                        label="Preferred Admin Username"
                        name="preferredAdminUsername"
                        value={formData.preferredAdminUsername}
                        onChange={handleChange}
                        required
                        placeholder="hospitaladmin"
                      />
                    </div>
                  </div>
                </section>

                <Divider />

                {/* Section 03 */}
                <section>
                  <SectionHeader
                    number="03"
                    title="Verification Documents"
                    description="Add a reference for the registration or verification document for the Super Admin to review."
                  />

                  <InputField
                    label="Verification Document Reference"
                    name="verificationDocument"
                    value={formData.verificationDocument}
                    onChange={handleChange}
                    placeholder="Document name or reference number"
                  />

                  <div className="mt-5 rounded-2xl border border-[#d9eff3] bg-[#f1fcfd] p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg text-[#079eaf] shadow-sm">
                        i
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#123b56]">
                          What happens next?
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#607994]">
                          Your application will remain{' '}
                          <strong className="text-[#078f9f]">PENDING</strong>{' '}
                          until the HospitalFlow Super Admin reviews it.
                          Hospital Admin access is available after approval.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="mt-9 border-t border-[#e8eff6] pt-7">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#19c9d5] px-5 py-4 text-sm font-extrabold text-[#06243b] shadow-[0_8px_24px_rgba(25,201,213,0.18)] transition hover:bg-[#35d7e0] focus:outline-none focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06243b]/30 border-t-[#06243b]" />
                        Submitting Registration...
                      </>
                    ) : (
                      <>
                        Submit Hospital Registration
                        <span aria-hidden="true">→</span>
                      </>
                    )}
                  </button>

                  <p className="mt-4 text-center text-xs leading-5 text-[#91a2b8]">
                    By submitting, you agree to have your hospital details
                    reviewed by the HospitalFlow administration team.
                  </p>
                </div>
              </div>
            </form>
          )}

          <p className="mt-7 text-center text-xs text-[#91a2b8]">
            HospitalFlow · Smart OPD Platform
          </p>
        </div>
      </main>
    </div>
  );
}
