import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_TOKEN_KEY = 'hospitalflow_admin_token';

interface HospitalRegistration {
  id: number;
  hospitalName: string;
  registrationNumber: string;
  officialEmail: string;
  adminEmail: string;
  contactNumber?: string;
  city?: string;
  state?: string;
  authorizedPersonName?: string;
  designation?: string;
  verificationStatus: string;
  status: string;
  submissionDate?: string;
  reviewNotes?: string;
}

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate();

  const [registrations, setRegistrations] = useState<
    HospitalRegistration[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const token = sessionStorage.getItem(ADMIN_TOKEN_KEY);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:8080/api/hospital-registrations',
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load hospital registrations.');
      }

      const data = await response.json();
      setRegistrations(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load registrations.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const pendingCount = registrations.filter(
    (item) => item.status === 'PENDING'
  ).length;

  const approvedCount = registrations.filter(
    (item) => item.status === 'APPROVED'
  ).length;

  const rejectedCount = registrations.filter(
    (item) => item.status === 'REJECTED'
  ).length;

  const handleStatusChange = async (
    id: number,
    status: 'UNDER_REVIEW' | 'REJECTED'
  ) => {
    try {
      setProcessingId(id);
      setError('');

      const reviewNotes =
        status === 'UNDER_REVIEW'
          ? 'Application is under review by Super Admin.'
          : 'Hospital registration application rejected by Super Admin.';

      const response = await fetch(
        `http://localhost:8080/api/hospital-registrations/${id}/status?status=${status}&reviewNotes=${encodeURIComponent(
          reviewNotes
        )}`,
        {
          method: 'PATCH',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update registration status.');
      }

      await fetchRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update registration.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      setError('');

      const response = await fetch(
        `http://localhost:8080/api/hospital-registrations/${id}/approve`,
        {
          method: 'POST',
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(
          message || 'Failed to approve hospital registration.'
        );
      }

      await fetchRegistrations();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to approve registration.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem('hospitalflow_admin');
    navigate('/login');
  };

  return (
    <div className="super-admin-dashboard-page min-h-screen bg-[#f4f7fb] text-[#10213b]">
      {/* Header */}
      <header className="border-b border-[#dce4ef] bg-white">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4">
          <div>
            <p className="text-[12px] font-medium text-[#2468b5]">
              HospitalFlow · Platform Administration
            </p>

            <h1 className="text-[24px] font-bold">
              Super Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[14px] font-semibold">
                HospitalFlow Super Admin
              </p>
              <p className="text-[12px] text-[#718096]">
                Platform Administrator
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-[#d7e0eb] bg-white px-4 py-2 text-[13px] font-semibold text-[#31506f] hover:bg-[#f7f9fc]"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-[28px] font-bold">
            Platform Overview
          </h2>

          <p className="mt-1 text-[14px] text-[#63748a]">
            Manage hospitals and registration applications across
            HospitalFlow.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-[#dce4ef] bg-white p-6 shadow-sm">
            <p className="text-[13px] font-medium text-[#718096]">
              Total Applications
            </p>

            <p className="mt-2 text-[30px] font-bold">
              {registrations.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f1d89b] bg-[#fffaf0] p-6 shadow-sm">
            <p className="text-[13px] font-medium text-[#8a6500]">
              Pending Review
            </p>

            <p className="mt-2 text-[30px] font-bold text-[#8a6500]">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#bfe7d8] bg-[#f3fcf8] p-6 shadow-sm">
            <p className="text-[13px] font-medium text-[#18794e]">
              Approved
            </p>

            <p className="mt-2 text-[30px] font-bold text-[#18794e]">
              {approvedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#f0c9c9] bg-[#fff7f7] p-6 shadow-sm">
            <p className="text-[13px] font-medium text-[#a33a3a]">
              Rejected
            </p>

            <p className="mt-2 text-[30px] font-bold text-[#a33a3a]">
              {rejectedCount}
            </p>
          </div>
        </div>

        {/* Registration Management */}
        <section className="mt-8 rounded-2xl border border-[#dce4ef] bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-[#e5ebf2] px-6 py-5 md:flex-row md:items-center">
            <div>
              <h3 className="text-[19px] font-bold">
                Hospital Registration Applications
              </h3>

              <p className="mt-1 text-[13px] text-[#718096]">
                Review and approve hospitals requesting access to
                HospitalFlow.
              </p>
            </div>

            <button
              onClick={fetchRegistrations}
              className="rounded-lg bg-[#1769aa] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#125a91]"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center text-[14px] text-[#718096]">
              Loading hospital registrations...
            </div>
          ) : registrations.length === 0 ? (
            <div className="px-6 py-12 text-center text-[14px] text-[#718096]">
              No hospital registration applications found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-[#e5ebf2] bg-[#f8fafc] text-left">
                    <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                      Hospital
                    </th>

                    <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                      Registration
                    </th>

                    <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#718096]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {registrations.map((registration) => {
                    const isPending =
                      registration.status === 'PENDING';

                    const isUnderReview =
                      registration.status === 'UNDER_REVIEW';

                    return (
                      <tr
                        key={registration.id}
                        className="border-b border-[#edf1f6] last:border-b-0"
                      >
                        <td className="px-6 py-5">
                          <p className="font-semibold text-[#14253d]">
                            {registration.hospitalName}
                          </p>

                          <p className="mt-1 text-[12px] text-[#718096]">
                            {registration.city || '—'}
                            {registration.state
                              ? `, ${registration.state}`
                              : ''}
                          </p>

                          <p className="mt-1 text-[12px] text-[#718096]">
                            {registration.officialEmail}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-[13px] font-semibold">
                            {registration.registrationNumber}
                          </p>

                          <p className="mt-1 text-[12px] text-[#718096]">
                            Application #{registration.id}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <p className="text-[13px]">
                            {registration.contactNumber || '—'}
                          </p>

                          <p className="mt-1 text-[12px] text-[#718096]">
                            Admin: {registration.adminEmail}
                          </p>
                        </td>

                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                              registration.status === 'PENDING'
                                ? 'bg-[#fff4d6] text-[#946200]'
                                : registration.status ===
                                  'UNDER_REVIEW'
                                ? 'bg-[#eaf3ff] text-[#1769aa]'
                                : registration.status ===
                                  'APPROVED'
                                ? 'bg-[#e8f8f0] text-[#18794e]'
                                : 'bg-[#fff0f0] text-[#a33a3a]'
                            }`}
                          >
                            {registration.status}
                          </span>
                        </td>

                        <td className="px-6 py-5">
                          {(isPending || isUnderReview) && (
                            <div className="flex flex-wrap gap-2">
                              {isPending && (
                                <button
                                  disabled={
                                    processingId ===
                                    registration.id
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      registration.id,
                                      'UNDER_REVIEW'
                                    )
                                  }
                                  className="rounded-lg border border-[#1769aa] px-3 py-2 text-[12px] font-semibold text-[#1769aa] hover:bg-[#eef6ff] disabled:opacity-50"
                                >
                                  Under Review
                                </button>
                              )}

                              <button
                                disabled={
                                  processingId ===
                                  registration.id
                                }
                                onClick={() =>
                                  handleApprove(
                                    registration.id
                                  )
                                }
                                className="rounded-lg bg-[#16845b] px-3 py-2 text-[12px] font-semibold text-white hover:bg-[#126c4a] disabled:opacity-50"
                              >
                                {processingId ===
                                registration.id
                                  ? 'Processing...'
                                  : 'Approve'}
                              </button>

                              <button
                                disabled={
                                  processingId ===
                                  registration.id
                                }
                                onClick={() =>
                                  handleStatusChange(
                                    registration.id,
                                    'REJECTED'
                                  )
                                }
                                className="rounded-lg border border-[#d65c5c] px-3 py-2 text-[12px] font-semibold text-[#b23b3b] hover:bg-[#fff4f4] disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {registration.status ===
                            'APPROVED' && (
                            <span className="text-[12px] font-semibold text-[#18794e]">
                              Hospital Approved
                            </span>
                          )}

                          {registration.status ===
                            'REJECTED' && (
                            <span className="text-[12px] font-semibold text-[#a33a3a]">
                              Application Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}