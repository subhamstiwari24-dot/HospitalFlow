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

        <div className="relative">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 mb-4">

            <span className="h-1.5 w-1.5 rounded-full bg-[#0F8B8D] shadow-[0_0_8px_#0F8B8D]" />

            <span className="text-[11px] font-semibold tracking-wide text-[#0F7375]">

              OPD BOOKING

            </span>

          </div>

          <h1 className="text-[30px] sm:text-[36px] font-bold leading-tight tracking-[-0.5px] text-[#142033]">

            Find Your Hospital

          </h1>

          <p className="mt-2 max-w-[620px] text-[13px] sm:text-[14px] text-slate-600">

            Search hospitals, check OPD availability and choose where

            you want to consult your doctor.

          </p>

        </div>

      </div>

      {/* =================================================

          SEARCH + FILTER

      ================================================= */}

      <div className="relative mb-7">

        <div className="relative rounded-[20px] border border-[#dce4ed] bg-white p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">

          {/* Search input */}

          <div className="relative">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[19px] text-[#0F8B8D]">

              ⌕

            </span>

            <input

              type="text"

              value={search}

              onChange={(e) => setSearch(e.target.value)}

              placeholder="Search hospital by name or location..."

              className="h-[48px] w-full rounded-[14px] border border-[#dce4ed] bg-white pl-[46px] pr-4 text-[13px] text-[#142033] outline-none placeholder:text-slate-400 transition-all focus:border-[#0F8B8D]/50 focus:ring-2 focus:ring-[#0F8B8D]/10"

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

                        ? 'shrink-0 rounded-[10px] border border-[#0F8B8D] bg-[#0F8B8D] px-4 py-2 text-[11px] font-bold text-white shadow-[0_0_18px_rgba(15,139,141,0.10)] transition-all'

                        : 'shrink-0 rounded-[10px] border border-[#dce4ed] bg-white px-4 py-2 text-[11px] font-semibold text-slate-600 transition-all hover:border-[#0F8B8D]/30 hover:bg-[#0F8B8D]/[0.05] hover:text-[#0F7375]'

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

        <div className="rounded-[20px] border border-[#dce4ed] bg-white p-10 text-center">

          <div className="mx-auto mb-4 h-9 w-9 rounded-full border-2 border-white/10 border-t-[#0F8B8D] animate-spin" />

          <p className="text-[13px] text-slate-600">

            Loading hospitals from HospitalFlow\...

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

              <p className="mt-1 text-[14px] font-semibold text-[#142033]">

                {filtered.length}{' '}

                {filtered.length === 1 ? 'hospital' : 'hospitals'} found

              </p>

            </div>

            {selectedHospital && (

              <div className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-[#0F7375]">

                <span className="h-1.5 w-1.5 rounded-full bg-[#0F8B8D] shadow-[0_0_8px_#0F8B8D]" />

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

                      ? 'group relative overflow-hidden rounded-[22px] border border-[#0F7375] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,35,60,0.08)] transition-all duration-300 focus-visible:outline-none'

                      : 'group relative overflow-hidden rounded-[22px] border border-[#dce4ed] bg-white p-5 sm:p-6 shadow-[0_8px_24px_rgba(15,35,60,0.06)] transition-all duration-300 hover:-translate-y-[2px] hover:border-[#0F8B8D]/30 hover:bg-[#f8fbfd] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)] focus-visible:outline-none'

                  }

                >

                  {/* Selected glow */}

                  <div className="relative flex items-start gap-4">

                    {/* Avatar */}

                    <div

                      className={

                        isSelected

                          ? 'flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-[#0F8B8D]/30 bg-[#0F8B8D]/10 shadow-[0_0_20px_rgba(15,139,141,0.08)]'

                          : 'flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-[#dce4ed] bg-[#F0F5FA]'

                      }

                    >

                      <span

                        className={

                          isSelected

                            ? 'text-[15px] font-bold text-[#0F7375]'

                            : 'text-[15px] font-bold text-[#0F8B8D]'

                        }

                      >

                        {initials}

                      </span>

                    </div>

                    {/* Details */}

                    <div className="min-w-0 flex-1">

                      {/* Name */}

                      <div className="flex flex-wrap items-start gap-2 pr-8">

                        <h3 className="text-[16px] sm:text-[17px] font-bold leading-tight text-[#142033]">

                          {hospital.name}

                        </h3>

                        <span className="rounded-full border border-[#0F8B8D]/15 bg-cyan-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#0F7375]">

                          Hospital

                        </span>

                      </div>

                      {/* Location */}

                      <div className="mt-2 flex items-center gap-2 text-[12px] text-slate-600">

                        <span className="text-[#0F8B8D]">●</span>

                        <span className="truncate">

                          {hospital.location}, {hospital.city}

                        </span>

                      </div>

                      {/* Status */}

                      <div className="mt-4 flex flex-wrap items-center gap-2">

                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-emerald-400/10 bg-emerald-400/[0.07] px-2.5 py-1.5 text-[10px] font-semibold text-emerald-700">

                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                          Active

                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#0F8B8D]/10 bg-cyan-50 px-2.5 py-1.5 text-[10px] font-medium text-[#0F7375]">

                          <span>✦</span>

                          HospitalFlow Connected

                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#e2e8f0] bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-600">

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

                          ? 'absolute right-0 top-0 flex h-[25px] w-[25px] items-center justify-center rounded-full border border-[#0F8B8D] bg-[#0F8B8D] shadow-[0_0_16px_rgba(15,139,141,0.18)]'

                          : 'absolute right-0 top-0 flex h-[25px] w-[25px] items-center justify-center rounded-full border border-[#cbd5e1] bg-white transition-all group-hover:border-[#0F8B8D]/40'

                      }

                    >

                      {isSelected && (

                        <span className="text-[12px] font-black text-white">

                          ✓

                        </span>

                      )}

                    </div>

                  </div>

                  {/* Selected information */}

                  {isSelected && (

                    <div className="relative mt-5 flex items-center justify-between border-t border-[#0F8B8D]/10 pt-4">

                      <span className="text-[10px] font-semibold text-[#0F7375]">

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

              <div className="rounded-[22px] border border-[#dce4ed] bg-white px-6 py-12">

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

                      className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[12px] font-semibold text-slate-300 transition-all hover:border-[#0F8B8D]/30 hover:text-[#0F7375]"

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

          <div className="sticky bottom-4 z-10 rounded-[18px] border border-[#dce4ed] bg-white p-3 sm:p-3.5 shadow-[0_8px_24px_rgba(15,35,60,0.10)] backdrop-blur-xl">

            <div className="flex items-center justify-between gap-3">

              {/* Selected hospital */}

              <div className="hidden min-w-0 sm:block">

                <p className="text-[10px] text-slate-500">

                  Selected hospital

                </p>

                <p className="mt-0.5 max-w-[320px] truncate text-[12px] font-semibold text-[#142033]">

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

                className="ml-auto rounded-[12px] bg-[#0F8B8D] px-6 sm:px-7 py-3 text-[12px] sm:text-[13px] font-bold text-white shadow-[0_0_20px_rgba(15,139,141,0.10)] transition-all hover:bg-[#0B6F72] hover:shadow-sm active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"

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