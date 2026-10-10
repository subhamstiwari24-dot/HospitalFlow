
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IdCard,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';

interface PatientProfile {
  patientId: string;
  fullName: string;
  age: number;
  phone: string;
  email: string;
  active: boolean;
}

const cardClass =
  'rounded-2xl border border-slate-200 bg-white shadow-sm';

export default function PatientProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError('');

        const storedPatient = sessionStorage.getItem(
          'hospitalflow_patient',
        );

        if (!storedPatient) {
          throw new Error('Patient login session not found.');
        }

        const patientSession = JSON.parse(storedPatient);

        if (!patientSession.phone) {
          throw new Error('Patient mobile number not found.');
        }

        const response = await fetch(
          `/api/patients/profile/${encodeURIComponent(
            patientSession.phone,
          )}`,
        );

        if (!response.ok) {
          throw new Error('Unable to fetch patient profile.');
        }

        const data: PatientProfile = await response.json();

        if (cancelled) return;

        setProfile(data);
        setEditName(data.fullName ?? '');
        setEditAge(String(data.age ?? ''));
      } catch (err) {
        console.error('Profile loading error:', err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load your profile.',
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const initials =
    profile?.fullName
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'P';

  const handleEdit = () => {
    if (!profile) return;

    setEditName(profile.fullName);
    setEditAge(String(profile.age));
    setSaveError('');
    setSuccessMessage('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!profile) return;

    setEditName(profile.fullName);
    setEditAge(String(profile.age));
    setSaveError('');
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile || saving) return;

    setSaveError('');
    setSuccessMessage('');

    const trimmedName = editName.trim();
    const numericAge = Number(editAge);

    if (!trimmedName) {
      setSaveError('Full name is required.');
      return;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setSaveError('Please enter a valid age between 1 and 120.');
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/patients/profile/${encodeURIComponent(profile.phone)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: trimmedName,
            age: numericAge,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message || 'Unable to update profile.',
        );
      }

      const updatedName = data.fullName ?? trimmedName;
      const updatedAge = data.age ?? numericAge;

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              fullName: updatedName,
              age: updatedAge,
            }
          : previous,
      );

      setEditName(updatedName);
      setEditAge(String(updatedAge));

      // Keep the logged-in session in sync with the updated profile.
      const storedPatient = sessionStorage.getItem(
        'hospitalflow_patient',
      );

      if (storedPatient) {
        try {
          const patientSession = JSON.parse(storedPatient);

          patientSession.fullName = updatedName;
          patientSession.age = updatedAge;

          sessionStorage.setItem(
            'hospitalflow_patient',
            JSON.stringify(patientSession),
          );
        } catch (sessionError) {
          console.error(
            'Unable to update stored patient session:',
            sessionError,
          );
        }
      }

      setSuccessMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);

      setSaveError(
        err instanceof Error
          ? err.message
          : 'Unable to update profile.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading your profile...
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8fc] px-4 py-8">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <User size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Profile unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || 'Unable to load patient profile.'}
          </p>

          <button
            onClick={() => navigate('/patient/dashboard')}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#082b45] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#10415f]"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] px-4 py-6 text-slate-800 sm:px-7 sm:py-8 lg:px-9">
      <div className="mx-auto max-w-[1100px]">
        {/* Page heading */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-700">
              Patient Account
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage your personal information and review your
              registered patient details.
            </p>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#082b45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10415f]"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2 self-start rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-2.5 text-xs font-semibold text-cyan-800">
              <Pencil size={14} />
              Editing profile
            </div>
          )}
        </div>

        {/* Feedback messages */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <X size={19} className="mt-0.5 shrink-0" />
            <p>{saveError}</p>
          </div>
        )}

        {/* Profile hero */}
        <section className={`${cardClass} mb-6 overflow-hidden`}>
          <div className="h-2 bg-gradient-to-r from-[#082b45] via-cyan-600 to-cyan-300" />

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-sky-50 text-2xl font-bold text-[#082b45] ring-1 ring-cyan-100">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                  {profile.fullName}
                </h2>

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    profile.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      profile.active ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {profile.active ? 'Active Account' : 'Inactive Account'}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500">
                Your HospitalFlow patient account
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <IdCard size={15} className="text-cyan-700" />
                  Patient ID:
                  <strong className="font-semibold text-slate-800">
                    {profile.patientId}
                  </strong>
                </span>

                <span className="inline-flex items-center gap-2">
                  <ShieldCheck size={15} className="text-cyan-700" />
                  Registered Patient
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Information heading */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Personal Information
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Your registered contact and personal details
          </p>
        </div>

        {/* Information grid */}
        <section className={`${cardClass} overflow-hidden`}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Full name */}
            <div className="border-b border-slate-100 p-5 sm:p-6 md:border-r">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <User size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Full Name
                  </p>

                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      autoComplete="name"
                      maxLength={100}
                      placeholder="Enter your full name"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50"
                    />
                  ) : (
                    <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                      {profile.fullName}
                    </p>
                  )}

                  <p className="mt-2 text-[10px] text-slate-400">
                    Your registered name
                  </p>
                </div>
              </div>
            </div>

            {/* Patient ID */}
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <IdCard size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Patient ID
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {profile.patientId}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Unique identifier · Read only
                  </p>
                </div>
              </div>
            </div>

            {/* Age */}
            <div className="border-b border-slate-100 p-5 sm:p-6 md:border-r">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <CalendarDays size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Age
                  </p>

                  {isEditing ? (
                    <input
                      type="number"
                      min={1}
                      max={120}
                      step={1}
                      value={editAge}
                      onChange={(event) => setEditAge(event.target.value)}
                      placeholder="Enter your age"
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-600 focus:ring-4 focus:ring-cyan-50"
                    />
                  ) : (
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {profile.age} years
                    </p>
                  )}

                  <p className="mt-2 text-[10px] text-slate-400">
                    {isEditing ? 'Enter an age from 1 to 120' : 'Registered age'}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Phone size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Mobile Number
                  </p>

                  <p className="mt-2 break-words text-sm font-semibold text-slate-900">
                    {profile.phone}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Contact number · Read only
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="border-b border-slate-100 p-5 sm:p-6 md:border-r md:border-b-0">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <Mail size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-900">
                    {profile.email || 'Not provided'}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Registered email · Read only
                  </p>
                </div>
              </div>
            </div>

            {/* Account status */}
            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    profile.active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <ShieldCheck size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">
                    Account Status
                  </p>

                  <p
                    className={`mt-2 text-sm font-semibold ${
                      profile.active ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {profile.active ? 'Active' : 'Inactive'}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-400">
                    Current account status
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit actions */}
          {isEditing && (
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:justify-end sm:px-6">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={16} />
                Cancel
              </button>

              <button
                onClick={() => void handleSave()}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082b45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#10415f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        {/* Information note */}
        <section className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#082b45]">
                Your information is important
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600">
                Your registered profile details are retrieved from
                HospitalFlow. You can update your name and age here.
                Your patient ID, mobile number, and email are read-only
                on this page.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pb-3 text-[10px] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-cyan-700" />
            Secure Patient Access
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

          <span className="inline-flex items-center gap-1.5">
            <Activity size={12} className="text-cyan-700" />
            Smart OPD Management
          </span>

          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={12} />
            HospitalFlow
          </span>
        </footer>
      </div>
    </div>
  );
}
