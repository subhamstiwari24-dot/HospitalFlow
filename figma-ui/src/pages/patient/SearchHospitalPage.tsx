import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PatientLayout from '../../components/PatientLayout';
import { usePatient } from '../../context/PatientContext';

import type { Hospital } from '../../types';

import { usePageLoad } from '../../hooks/usePageLoad';
import { SkHospitalSearch } from '../../components/Skeleton';
import EmptyState, {
  EmptyIcons,
  ErrorState,
} from '../../components/EmptyState';

type BackendHospital = {
  id: number;
  name: string;
  address?: string;
  city: string;
  phone?: string;
  active: boolean;
};

type PatientHospital = Hospital & {
  backendId: number;
};

export default function SearchHospitalPage() {
  const navigate = useNavigate();

  const {
    selectedHospital,
    setSelectedHospital,
    setSelectedDepartment,
    setSelectedDoctor,
    setSelectedSlot,
  } = usePatient();

  const [hospitals, setHospitals] = useState<PatientHospital[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] =
    useState<Hospital['type'] | 'All'>('All');

  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const pageLoading = usePageLoad(400);

  const API_URL = '/api';

  /* =====================================================
     LOAD HOSPITALS
  ===================================================== */

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoadingHospitals(true);
        setError('');

        const response = await fetch(`${API_URL}/hospitals`);

        if (!response.ok) {
          throw new Error('Unable to load hospitals');
        }

        const data: BackendHospital[] = await response.json();

        const mappedHospitals: PatientHospital[] = data
          .filter((hospital) => hospital.active)
          .map((hospital) => ({
            backendId: hospital.id,
            id: hospital.id,
            name: hospital.name,
            location: hospital.address || 'Address not available',
            city: hospital.city,
            type: 'Private',
            rating: 0,
            departments: 0,
            distance: '—',
            timing: 'OPD timings available at hospital',
            departments_list: [],
          }));

        setHospitals(mappedHospitals);
      } catch (err) {
        console.error('Hospital loading error:', err);

        setError(
          'Unable to connect to HospitalFlow backend. Please make sure the Spring Boot server is running.'
        );
      } finally {
        setLoadingHospitals(false);
      }
    };

    loadHospitals();
  }, [retryKey]);

  /* =====================================================
     FILTER HOSPITALS
  ===================================================== */

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return hospitals.filter((hospital) => {
      const matchSearch =
        hospital.name.toLowerCase().includes(searchValue) ||
        hospital.location.toLowerCase().includes(searchValue) ||
        hospital.city.toLowerCase().includes(searchValue);

      const matchType =
        typeFilter === 'All' || hospital.type === typeFilter;

      return matchSearch && matchType;
    });
  }, [hospitals, search, typeFilter]);

  /* =====================================================
     SELECT HOSPITAL
  ===================================================== */

  const handleSelect = (hospital: PatientHospital) => {
    setSelectedHospital(hospital);

    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  /* =====================================================
     CONTINUE
  ===================================================== */

  const handleContinue = () => {
    if (!selectedHospital) return;

    navigate('/patient/department');
  };

  /* =====================================================
     LOADING SKELETON
  ===================================================== */

  if (pageLoading) {
    return (
      <PatientLayout
        step={0}
        showBack={false}
        maxWidth="max-w-[1050px]"
      >
        <SkHospitalSearch />
      </PatientLayout>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <PatientLayout
      step={0}
      showBack={false}
      maxWidth="max-w-[1050px]"
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="relative mb-8 sm:mb-10">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-[80px] pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />

            <span className="text-[11px] font-semibold tracking-wide text-[#8ef8ff]">
              OPD BOOKING
            </span>
          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold leading-tight tracking-[-0.5px] text-white">
            Find Your Hospital
          </h1>

          <p className="mt-2 max-w-[620px] text-[13px] sm:text-[14px] text-slate-400">
            Search hospitals, check OPD availability and choose where
            you want to consult your doctor.
          </p>
        </div>
      </div>

      {/* =================================================
          SEARCH + FILTER
      ================================================= */}

      <div className="relative mb-7">
        <div className="absolute -inset-1 rounded-[22px] bg-cyan-400/[0.04] blur-xl pointer-events-none" />

        <div className="relative rounded-[20px] border border-white/[0.08] bg-[#071b31]/90 p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          {/* Search input */}

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[19px] text-[#16d9e3]">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospital by name or location..."
              className="h-[48px] w-full rounded-[14px] border border-white/[0.08] bg-[#031326] pl-[46px] pr-4 text-[13px] text-white outline-none placeholder:text-slate-600 transition-all focus:border-[#16d9e3]/50 focus:ring-2 focus:ring-[#16d9e3]/10"
            />
          </div>

          {/* Filters */}

          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="hidden sm:block mr-1 text-[11px] text-slate-600">
              Filter:
            </span>

            {(['All', 'Government', 'Private', 'Trust'] as const).map(
              (type) => {
                const active = typeFilter === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    aria-pressed={active}
                    className={
                      active
                        ? 'shrink-0 rounded-[10px] border border-[#16d9e3] bg-[#16d9e3] px-4 py-2 text-[11px] font-bold text-[#031326] shadow-[0_0_18px_rgba(22,217,227,0.18)] transition-all'
                        : 'shrink-0 rounded-[10px] border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-[11px] font-semibold text-slate-400 transition-all hover:border-[#16d9e3]/30 hover:bg-[#16d9e3]/[0.05] hover:text-[#8ef8ff]'
                    }
                  >
                    {type}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && !loadingHospitals && (
        <div className="mb-6">
          <ErrorState
            description={error}
            onRetry={() => setRetryKey((key) => key + 1)}
          />
        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loadingHospitals && (
        <div className="rounded-[20px] border border-white/10 bg-[#071b31] p-10 text-center">
          <div className="mx-auto mb-4 h-9 w-9 rounded-full border-2 border-white/10 border-t-[#16d9e3] animate-spin" />

          <p className="text-[13px] text-slate-400">
            Loading hospitals from HospitalFlow...
          </p>
        </div>
      )}

      {/* =================================================
          HOSPITAL LIST
      ================================================= */}

      {!loadingHospitals && !error && (
        <div>
          {/* Result header */}

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-500">
                AVAILABLE HOSPITALS
              </p>

              <p className="mt-1 text-[14px] font-semibold text-white">
                {filtered.length}{' '}
                {filtered.length === 1 ? 'hospital' : 'hospitals'} found
              </p>
            </div>

            {selectedHospital && (
              <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[#8ef8ff]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#16d9e3] shadow-[0_0_8px_#16d9e3]" />
                Hospital selected
              </div>
            )}
          </div>

          {/* Cards */}

          <div className="mb-8 flex flex-col gap-4">
            {filtered.map((hospital) => {
              const isSelected =
                selectedHospital?.id === hospital.id;

              const initials = hospital.name
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase();

              return (
                <div
                  key={hospital.id}
                  onClick={() => handleSelect(hospital)}
                  onKeyDown={(event) => {
                    if (
                      event.key === 'Enter' ||
                      event.key === ' '
                    ) {
                      event.preventDefault();
                      handleSelect(hospital);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={
                    isSelected
                      ? 'group relative overflow-hidden rounded-[22px] border border-[#16d9e3]/70 bg-[#0a243d] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(22,217,227,0.12),0_15px_45px_rgba(0,0,0,0.22),0_0_35px_rgba(22,217,227,0.07)] transition-all duration-300 focus-visible:outline-none'
                      : 'group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[#16d9e3]/30 hover:bg-[#092039] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] focus-visible:outline-none'
                  }
                >
                  {/* Selected glow */}

                  {isSelected && (
                    <div className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full bg-[#16d9e3]/10 blur-[55px]" />
                  )}

                  <div className="relative flex items-start gap-4">
                    {/* Avatar */}

                    <div
                      className={
                        isSelected
                          ? 'flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-[#16d9e3]/30 bg-[#16d9e3]/10 shadow-[0_0_20px_rgba(22,217,227,0.12)]'
                          : 'flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-white/[0.07] bg-[#0b2742]'
                      }
                    >
                      <span
                        className={
                          isSelected
                            ? 'text-[15px] font-bold text-[#8ef8ff]'
                            : 'text-[15px] font-bold text-[#16d9e3]'
                        }
                      >
                        {initials}
                      </span>
                    </div>

                    {/* Details */}

                    <div className="min-w-0 flex-1">
                      {/* Name */}

                      <div className="flex flex-wrap items-start gap-2 pr-8">
                        <h3 className="text-[16px] sm:text-[17px] font-bold leading-tight text-white">
                          {hospital.name}
                        </h3>

                        <span className="rounded-full border border-[#16d9e3]/15 bg-[#16d9e3]/[0.08] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#8ef8ff]">
                          Hospital
                        </span>
                      </div>

                      {/* Location */}

                      <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-400">
                        <span className="text-[#16d9e3]">●</span>

                        <span className="truncate">
                          {hospital.location}, {hospital.city}
                        </span>
                      </div>

                      {/* Status */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-emerald-400/10 bg-emerald-400/[0.07] px-2.5 py-1.5 text-[10px] font-semibold text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#16d9e3]/10 bg-[#16d9e3]/[0.06] px-2.5 py-1.5 text-[10px] font-medium text-[#8ef8ff]">
                          <span>✦</span>
                          HospitalFlow Connected
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-white/[0.06] bg-white/[0.035] px-2.5 py-1.5 text-[10px] font-medium text-slate-400">
                          Live OPD
                        </span>
                      </div>

                      {/* Phone */}

                      {hospital.phone && (
                        <p className="mt-3 text-[11px] text-slate-500">
                          ☎ {hospital.phone}
                        </p>
                      )}
                    </div>

                    {/* Selection circle */}

                    <div
                      className={
                        isSelected
                          ? 'absolute right-0 top-0 flex h-[25px] w-[25px] items-center justify-center rounded-full border border-[#16d9e3] bg-[#16d9e3] shadow-[0_0_16px_rgba(22,217,227,0.35)]'
                          : 'absolute right-0 top-0 flex h-[25px] w-[25px] items-center justify-center rounded-full border border-white/15 bg-white/[0.02] transition-all group-hover:border-[#16d9e3]/40'
                      }
                    >
                      {isSelected && (
                        <span className="text-[12px] font-black text-[#031326]">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected information */}

                  {isSelected && (
                    <div className="relative mt-5 flex items-center justify-between border-t border-[#16d9e3]/10 pt-4">
                      <span className="text-[10px] font-semibold text-[#8ef8ff]">
                        ✓ Hospital selected
                      </span>

                      <span className="text-[10px] text-slate-500">
                        Ready to continue
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* No results */}

            {filtered.length === 0 && !error && (
              <div className="rounded-[22px] border border-white/[0.08] bg-[#071b31]/90 px-6 py-12">
                <EmptyState
                  icon={EmptyIcons.mapPin(28)}
                  title="No hospitals found"
                  description="Try a different search term."
                  action={
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setTypeFilter('All');
                      }}
                      className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] font-semibold text-slate-300 transition-all hover:border-[#16d9e3]/30 hover:text-[#8ef8ff]"
                    >
                      Clear search
                    </button>
                  }
                />
              </div>
            )}
          </div>

          {/* =================================================
              BOTTOM CTA
          ================================================= */}

          <div className="sticky bottom-4 z-10 rounded-[18px] border border-white/[0.08] bg-[#06182b]/95 p-3 sm:p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              {/* Selected hospital */}

              <div className="hidden min-w-0 sm:block">
                <p className="text-[10px] text-slate-500">
                  Selected hospital
                </p>

                <p className="mt-0.5 max-w-[320px] truncate text-[12px] font-semibold text-white">
                  {selectedHospital
                    ? selectedHospital.name
                    : 'Please select a hospital'}
                </p>
              </div>

              {/* Continue */}

              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedHospital}
                className="ml-auto rounded-[12px] bg-[#16d9e3] px-6 sm:px-7 py-3 text-[12px] sm:text-[13px] font-bold text-[#031326] shadow-[0_0_20px_rgba(22,217,227,0.16)] transition-all hover:bg-[#5deaf0] hover:shadow-[0_0_28px_rgba(22,217,227,0.25)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
              >
                Continue to Department →
              </button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}