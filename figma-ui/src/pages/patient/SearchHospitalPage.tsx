import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../../components/PatientLayout';
import Button from '../../components/Button';
import { usePatient } from '../../context/PatientContext';
import type { Hospital } from '../../types';
import { usePageLoad } from '../../hooks/usePageLoad';
import { SkHospitalSearch } from '../../components/Skeleton';
import EmptyState, { EmptyIcons, ErrorState } from '../../components/EmptyState';

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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-[#f4a700] text-[12px]">★</span>
      <p className="font-semibold text-[#142033] text-[12px]">
        {rating.toFixed(1)}
      </p>
    </div>
  );
}

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

  /*
   * HospitalFlow backend
   */
  const API_URL = '/api';

  /*
   * Load hospitals from Spring Boot
   */
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

        /*
         * Convert backend hospital structure
         * into the structure expected by the Figma UI.
         *
         * We only use information actually available
         * from the backend. Fields such as rating,
         * distance and departments are not invented.
         */
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

  /*
   * Filter hospitals
   */
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

  /*
   * Select hospital
   */
  const handleSelect = (hospital: PatientHospital) => {
    setSelectedHospital(hospital);

    /*
     * Reset downstream selections.
     */
    setSelectedDepartment(null);
    setSelectedDoctor(null);
    setSelectedSlot(null);
  };

  /*
   * Continue to department selection
   */
  const handleContinue = () => {
    if (!selectedHospital) return;

    navigate('/patient/department');
  };

  if (pageLoading) {
    return (
      <PatientLayout
        step={0}
        showBack={false}
        maxWidth="max-w-[900px]"
      >
        <SkHospitalSearch />
      </PatientLayout>
    );
  }

  return (
    <PatientLayout
      step={0}
      showBack={false}
      maxWidth="max-w-[900px]"
    >
      {/* HEADER */}
      <div className="mb-[28px]">
        <h1 className="font-bold text-[#142033] text-[24px] leading-tight mb-[6px]">
          Search Hospital
        </h1>

        <p className="font-normal text-[#526176] text-[14px]">
          Find a hospital near you and book your OPD appointment.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <span className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#afc0d3] text-[14px]">
            🔍
          </span>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or location…"
            className="bg-white border border-[#d8e1ec] rounded-[10px] pl-[36px] pr-[14px] py-[10px] text-[14px] text-[#142033] placeholder:text-[#afc0d3] outline-none focus:border-[#155ead] transition-colors w-full"
          />
        </div>

        <div className="flex gap-[6px]">
          {(['All', 'Government', 'Private', 'Trust'] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                aria-pressed={typeFilter === type}
                className={`px-[14px] py-[8px] rounded-[8px] text-[12px] font-semibold transition-colors cursor-pointer border active:translate-y-px focus-visible:outline-2 focus-visible:outline-[#2475d0] focus-visible:outline-offset-2 ${
                  typeFilter === type
                    ? 'bg-[#155ead] text-white border-[#155ead]'
                    : 'bg-white border-[#d8e1ec] text-[#526176] hover:bg-[#f4f7fb]'
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>
      </div>

      {error && !loadingHospitals && (
        <ErrorState
          description={error}
          onRetry={() => setRetryKey((key) => key + 1)}
        />
      )}

      {/* LOADING */}
      {loadingHospitals && (
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[24px] text-center">
          <p className="text-[#526176] text-[14px]">
            Loading hospitals from HospitalFlow...
          </p>
        </div>
      )}

      {/* HOSPITAL LIST */}
      {!loadingHospitals && !error && (
        <div className="flex flex-col gap-[12px] mb-[24px]">
          {filtered.map((hospital) => (
            <div
              key={hospital.id}
              onClick={() => handleSelect(hospital)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelect(hospital);
                }
              }}
              role="button"
              tabIndex={0}
              className={`bg-white border rounded-[14px] p-[20px] cursor-pointer transition-[border-color,box-shadow,transform] focus-visible:outline-2 focus-visible:outline-[#2475d0] focus-visible:outline-offset-2 active:translate-y-px ${
                selectedHospital?.id === hospital.id
                  ? 'border-[#155ead] shadow-[0px_0px_0px_3px_rgba(21,94,173,0.12)]'
                  : 'border-[#d8e1ec] hover:border-[#afc0d3] shadow-[0px_2px_8px_0px_rgba(19,36,58,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between gap-[16px]">
                <div className="flex gap-[14px] items-start flex-1 min-w-0">
                  {/* HOSPITAL ICON */}
                  <div className="bg-[#eaf3fd] size-[48px] rounded-[12px] flex items-center justify-center shrink-0">
                    <p className="font-bold text-[#155ead] text-[16px]">
                      {hospital.name
                        .split(' ')
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join('')}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* NAME */}
                    <div className="flex items-center gap-[10px] flex-wrap mb-[4px]">
                      <p className="font-bold text-[#142033] text-[16px]">
                        {hospital.name}
                      </p>

                      <span className="text-[11px] font-bold px-[8px] py-[3px] rounded-[999px] bg-[#eaf3fd] text-[#155ead]">
                        Hospital
                      </span>
                    </div>

                    {/* LOCATION */}
                    <p className="font-normal text-[#526176] text-[13px] mb-[10px]">
                      📍 {hospital.location}, {hospital.city}
                    </p>

                    {/* REAL BACKEND INFO */}
                    <div className="flex items-center gap-[16px] flex-wrap">
                      {hospital.phone && (
                        <p className="font-normal text-[#526176] text-[12px]">
                          📞 {hospital.phone}
                        </p>
                      )}

                      <span className="text-[#d8e1ec]">·</span>

                      <p className="font-normal text-[#18865b] text-[12px] font-semibold">
                        ● Active
                      </p>
                    </div>

                    {/* LIVE CONNECTION LABEL */}
                    <div className="flex gap-[6px] mt-[12px] flex-wrap">
                      <span className="bg-[#e8f7f1] text-[#18865b] text-[11px] font-semibold px-[8px] py-[3px] rounded-[6px]">
                        HospitalFlow Connected
                      </span>

                      <span className="bg-[#f4f7fb] text-[#526176] text-[11px] font-medium px-[8px] py-[3px] rounded-[6px]">
                        Live OPD available
                      </span>
                    </div>
                  </div>
                </div>

                {/* SELECT INDICATOR */}
                <div
                  className={`size-[22px] rounded-[999px] border-2 flex items-center justify-center shrink-0 mt-[2px] transition-colors ${
                    selectedHospital?.id === hospital.id
                      ? 'border-[#155ead] bg-[#155ead]'
                      : 'border-[#d8e1ec]'
                  }`}
                >
                  {selectedHospital?.id === hospital.id && (
                    <span className="text-white text-[11px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* NO RESULTS */}
          {filtered.length === 0 && !error && (
            <EmptyState
              icon={EmptyIcons.mapPin(28)}
              title="No hospitals found"
              description="Try a different search term."
              action={
                <button
                  onClick={() => {
                    setSearch('');
                    setTypeFilter('All');
                  }}
                  className="border border-[#d8e1ec] bg-white text-[#526176] font-bold text-[13px] px-[16px] py-[10px] rounded-[10px] hover:bg-[#f4f7fb] transition-colors cursor-pointer"
                >
                  Clear search
                </button>
              }
            />
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center gap-[12px] flex-wrap">
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!selectedHospital}
          className="px-[28px] py-[12px] text-[14px]"
        >
          Select Department →
        </Button>

        {selectedHospital && (
          <p className="font-normal text-[#526176] text-[13px]">
            Selected:{' '}
            <span className="font-semibold text-[#142033]">
              {selectedHospital.name}
            </span>
          </p>
        )}
      </div>
    </PatientLayout>
  );
}