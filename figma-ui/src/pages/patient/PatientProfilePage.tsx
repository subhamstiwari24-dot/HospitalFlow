import { useEffect, useState } from 'react';
import {
  User,
  IdCard,
  CalendarDays,
  Phone,
  Mail,
  ShieldCheck,
  Pencil,
  Save,
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

export default function PatientProfilePage() {
  const [profile, setProfile] =
    useState<PatientProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] =
    useState(false);

  const [editName, setEditName] =
    useState('');

  const [editAge, setEditAge] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState('');

  const [saveError, setSaveError] =
    useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedPatient =
          sessionStorage.getItem(
            'hospitalflow_patient'
          );

        if (!storedPatient) {
          setError(
            'Patient login session not found.'
          );

          setLoading(false);
          return;
        }

        const patientSession =
          JSON.parse(storedPatient);

        if (!patientSession.phone) {
          setError(
            'Patient mobile number not found.'
          );

          setLoading(false);
          return;
        }

        const response = await fetch(
          `/api/patients/profile/${encodeURIComponent(
            patientSession.phone
          )}`
        );

        if (!response.ok) {
          throw new Error(
            'Unable to fetch patient profile'
          );
        }

        const data =
          await response.json();

        setProfile(data);

        setEditName(data.fullName);
        setEditAge(String(data.age));
      } catch (err) {
        console.error(
          'Profile loading error:',
          err
        );

        setError(
          'Unable to load your profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

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
    if (!profile) return;

    setSaveError('');
    setSuccessMessage('');

    const trimmedName =
      editName.trim();

    const numericAge =
      Number(editAge);

    if (!trimmedName) {
      setSaveError(
        'Full name is required.'
      );
      return;
    }

    if (
      !Number.isInteger(numericAge) ||
      numericAge < 1 ||
      numericAge > 120
    ) {
      setSaveError(
        'Please enter a valid age between 1 and 120.'
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/patients/profile/${encodeURIComponent(
          profile.phone
        )}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            fullName: trimmedName,
            age: numericAge,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to update profile.'
        );
      }

      setProfile((previous) =>
        previous
          ? {
              ...previous,
              fullName:
                data.fullName ??
                trimmedName,
              age:
                data.age ??
                numericAge,
            }
          : previous
      );

      /*
       * Keep the logged-in session in sync
       * with the updated profile.
       */
      const storedPatient =
        sessionStorage.getItem(
          'hospitalflow_patient'
        );

      if (storedPatient) {
        const patientSession =
          JSON.parse(storedPatient);

        patientSession.fullName =
          data.fullName ??
          trimmedName;

        patientSession.age =
          data.age ??
          numericAge;

        sessionStorage.setItem(
          'hospitalflow_patient',
          JSON.stringify(patientSession)
        );
      }

      setEditName(
        data.fullName ??
          trimmedName
      );

      setEditAge(
        String(
          data.age ??
            numericAge
        )
      );

      setSuccessMessage(
        'Profile updated successfully.'
      );

      setIsEditing(false);
    } catch (err) {
      console.error(
        'Profile update error:',
        err
      );

      setSaveError(
        err instanceof Error
          ? err.message
          : 'Unable to update profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="animate-spin h-8 w-8 border-4 border-slate-300 border-t-blue-600 rounded-full mx-auto mb-3" />

          <p className="text-slate-600">
            Loading your profile...
          </p>

        </div>

      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center max-w-md w-full">

          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">

            <User className="w-7 h-7 text-red-500" />

          </div>

          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Profile unavailable
          </h2>

          <p className="text-slate-500">
            {error ||
              'Unable to load patient profile.'}
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">

      <div className="max-w-4xl mx-auto">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-blue-600 mb-1">
              Patient Account
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              My Profile
            </h1>

            <p className="text-slate-500 mt-2">
              View and manage your registered patient information.
            </p>

          </div>


          {!isEditing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors cursor-pointer"
            >
              <Pencil size={17} />

              Edit Profile
            </button>
          )}

        </div>


        {/* =====================================================
            SUCCESS MESSAGE
            ===================================================== */}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            {successMessage}
          </div>
        )}


        {/* =====================================================
            SAVE ERROR
            ===================================================== */}

        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {saveError}
          </div>
        )}


        {/* =====================================================
            PROFILE HEADER CARD
            ===================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">

          <div className="flex items-center gap-5">

            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">

              <User className="w-10 h-10 text-blue-600" />

            </div>


            <div>

              <h2 className="text-2xl font-bold text-slate-900">

                {profile.fullName}

              </h2>

              <p className="text-slate-500 mt-1">

                Patient ID: {profile.patientId}

              </p>


              <div className="flex items-center gap-2 mt-3">

                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    profile.active
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />

                <span
                  className={`text-sm font-medium ${
                    profile.active
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >

                  {profile.active
                    ? 'Active Account'
                    : 'Inactive Account'}

                </span>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            PERSONAL INFORMATION
            ===================================================== */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">

            <div>

              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Your registered patient details
              </p>

            </div>


            {isEditing && (
              <div className="text-sm text-blue-600 font-medium">
                Editing profile
              </div>
            )}

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2">


            {/* =================================================
                FULL NAME
                ================================================= */}

            <div className="p-6 border-b md:border-r border-slate-200">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">

                  <User className="w-5 h-5 text-blue-600" />

                </div>


                <div className="flex-1">

                  <p className="text-sm text-slate-500">
                    Full Name
                  </p>


                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) =>
                        setEditName(
                          e.target.value
                        )
                      }
                      className="w-full mt-2 px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter full name"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {profile.fullName}
                    </p>
                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                PATIENT ID
                ================================================= */}

            <div className="p-6 border-b border-slate-200">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">

                  <IdCard className="w-5 h-5 text-purple-600" />

                </div>


                <div>

                  <p className="text-sm text-slate-500">
                    Patient ID
                  </p>

                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {profile.patientId}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Patient ID cannot be changed
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                AGE
                ================================================= */}

            <div className="p-6 md:border-r border-b md:border-b-0 border-slate-200">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">

                  <CalendarDays className="w-5 h-5 text-orange-600" />

                </div>


                <div className="flex-1">

                  <p className="text-sm text-slate-500">
                    Age
                  </p>


                  {isEditing ? (
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={editAge}
                      onChange={(e) =>
                        setEditAge(
                          e.target.value
                        )
                      }
                      className="w-full mt-2 px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      placeholder="Enter age"
                    />
                  ) : (
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {profile.age} years
                    </p>
                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                PHONE
                ================================================= */}

            <div className="p-6 border-b md:border-b-0 border-slate-200">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">

                  <Phone className="w-5 h-5 text-green-600" />

                </div>


                <div>

                  <p className="text-sm text-slate-500">
                    Mobile Number
                  </p>

                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {profile.phone}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Mobile number is currently read-only
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                EMAIL
                ================================================= */}

            <div className="p-6 md:border-r border-slate-200">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">

                  <Mail className="w-5 h-5 text-cyan-600" />

                </div>


                <div className="min-w-0">

                  <p className="text-sm text-slate-500">
                    Email Address
                  </p>

                  <p className="text-base font-semibold text-slate-900 mt-1 break-all">
                    {profile.email}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Email is currently read-only
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                ACCOUNT STATUS
                ================================================= */}

            <div className="p-6">

              <div className="flex items-start gap-4">

                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">

                  <ShieldCheck className="w-5 h-5 text-emerald-600" />

                </div>


                <div>

                  <p className="text-sm text-slate-500">
                    Account Status
                  </p>

                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {profile.active
                      ? 'Active'
                      : 'Inactive'}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              EDIT ACTIONS
              ================================================= */}

          {isEditing && (
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-3">

              <button
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >

                <X size={17} />

                Cancel

              </button>


              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >

                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />

                    Save Changes
                  </>
                )}

              </button>

            </div>
          )}

        </div>


        {/* =====================================================
            INFORMATION NOTE
            ===================================================== */}

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">

          <div className="flex gap-3">

            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />

            <div>

              <p className="font-medium text-blue-900">
                Profile information
              </p>

              <p className="text-sm text-blue-700 mt-1">
                Your registered age and personal details
                are fetched directly from your HospitalFlow
                patient profile.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}