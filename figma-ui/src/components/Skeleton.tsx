// Skeleton primitives and page-level skeleton layouts.
// Each Sk* component mirrors the shape of its real counterpart without any data.

// ─── Primitives ─────────────────────────────────────────────────────────────

export function Sk({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

function SkLine({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-[4px] h-[11px] ${className}`} />;
}

// ─── StatCard skeleton ───────────────────────────────────────────────────────

export function SkStatCard() {
  return (
    <div className="bg-white border border-[#d8e1ec] flex flex-1 gap-[16px] items-center p-[20px] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] min-w-0">
      <Sk className="size-[46px] rounded-[12px] shrink-0" />
      <div className="flex flex-col gap-[8px] flex-1 min-w-0">
        <SkLine className="w-[70px]" />
        <Sk className="h-[26px] w-[44px] rounded-[6px]" />
        <SkLine className="w-[110px]" />
      </div>
    </div>
  );
}

// ─── Queue / list rows ───────────────────────────────────────────────────────

export function SkQueueRow() {
  return (
    <div className="border-t border-[#d8e1ec] flex gap-[14px] items-center px-[20px] py-[13px]">
      <Sk className="h-[32px] w-[54px] rounded-[8px] shrink-0" />
      <div className="flex flex-col gap-[7px] flex-1 min-w-0">
        <SkLine className="w-[140px]" />
        <SkLine className="w-[100px]" />
      </div>
      <SkLine className="w-[48px] shrink-0" />
    </div>
  );
}

// ─── Current patient card ────────────────────────────────────────────────────

export function SkCurrentPatient() {
  return (
    <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
      <div className="border-[#d8e1ec] border-b flex items-center justify-between px-[20px] py-[15px]">
        <div className="flex gap-[10px] items-center">
          <Sk className="w-[4px] h-[20px] rounded-[2px] shrink-0" />
          <SkLine className="w-[120px]" />
        </div>
        <Sk className="h-[22px] w-[100px] rounded-[999px]" />
      </div>
      <div className="flex gap-[18px] items-center p-[20px]">
        <Sk className="size-[48px] rounded-[999px] shrink-0" />
        <div className="flex flex-col gap-[8px] flex-1 min-w-0">
          <SkLine className="w-[160px]" />
          <SkLine className="w-[130px]" />
          <SkLine className="w-[100px]" />
        </div>
        <Sk className="h-[58px] w-[80px] rounded-[12px] shrink-0" />
      </div>
      <div className="flex flex-wrap gap-[10px] items-center pb-[18px] px-[20px]">
        <Sk className="h-[36px] w-[100px] rounded-[10px]" />
        <Sk className="h-[36px] w-[80px] rounded-[10px]" />
        <Sk className="h-[36px] w-[60px] rounded-[10px]" />
      </div>
    </div>
  );
}

// ─── Generic card with header + rows ─────────────────────────────────────────

export function SkInfoCard({ title = true, rows = 4 }: { title?: boolean; rows?: number }) {
  return (
    <div className="bg-white border border-[#d8e1ec] rounded-[14px] p-[18px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
      {title && <Sk className="h-[14px] w-[120px] rounded-[4px] mb-[16px]" />}
      <div className="flex flex-col gap-[12px]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-[12px]">
            <SkLine className="w-[100px]" />
            <SkLine className="w-[70px]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appointment row (desktop table) ─────────────────────────────────────────

export function SkAppointmentTableRow() {
  return (
    <div className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0">
      <Sk className="h-[30px] w-[54px] rounded-[8px]" />
      <div className="flex gap-[10px] items-center min-w-0">
        <Sk className="size-[28px] rounded-[999px] shrink-0" />
        <div className="flex flex-col gap-[6px] min-w-0">
          <SkLine className="w-[110px]" />
          <SkLine className="w-[80px]" />
        </div>
      </div>
      <SkLine className="w-[70px]" />
      <SkLine className="w-[100px]" />
      <Sk className="h-[22px] w-[80px] rounded-[999px]" />
      <Sk className="h-[32px] w-[56px] rounded-[10px]" />
    </div>
  );
}

// ─── Appointment card (mobile) ────────────────────────────────────────────────

export function SkAppointmentMobileCard() {
  return (
    <div className="p-[16px] border-b border-[#d8e1ec] last:border-0">
      <div className="flex items-center gap-[10px] mb-[10px]">
        <Sk className="h-[30px] w-[54px] rounded-[8px] shrink-0" />
        <div className="flex items-center gap-[8px] flex-1 min-w-0">
          <Sk className="size-[28px] rounded-[999px] shrink-0" />
          <div className="flex flex-col gap-[6px] min-w-0">
            <SkLine className="w-[120px]" />
            <SkLine className="w-[80px]" />
          </div>
        </div>
        <Sk className="h-[22px] w-[70px] rounded-[999px] shrink-0" />
      </div>
      <div className="flex items-center justify-between gap-[10px]">
        <SkLine className="w-[130px]" />
        <Sk className="h-[32px] w-[56px] rounded-[10px] shrink-0" />
      </div>
    </div>
  );
}

// ─── Doctor table row (admin) ─────────────────────────────────────────────────

export function SkDoctorTableRow() {
  return (
    <div className="grid grid-cols-[1fr_130px_120px_80px_110px_56px] gap-[16px] items-center px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0">
      <div className="flex gap-[10px] items-center min-w-0">
        <Sk className="size-[34px] rounded-[999px] shrink-0" />
        <div className="flex flex-col gap-[6px] min-w-0">
          <SkLine className="w-[100px]" />
          <SkLine className="w-[70px]" />
        </div>
      </div>
      <SkLine className="w-[90px]" />
      <SkLine className="w-[80px]" />
      <SkLine className="w-[24px]" />
      <Sk className="h-[22px] w-[80px] rounded-[999px]" />
      <Sk className="h-[28px] w-[36px] rounded-[8px]" />
    </div>
  );
}

// ─── Admin doctor status table row ───────────────────────────────────────────

export function SkAdminDoctorRow() {
  return (
    <div className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] items-center px-[20px] py-[12px] border-b border-[#d8e1ec] last:border-0">
      <div className="flex gap-[10px] items-center min-w-0">
        <Sk className="size-[32px] rounded-[999px] shrink-0" />
        <div className="flex flex-col gap-[6px] min-w-0">
          <SkLine className="w-[110px]" />
          <SkLine className="w-[70px]" />
        </div>
      </div>
      <SkLine className="w-[90px]" />
      <Sk className="h-[22px] w-[80px] rounded-[999px]" />
      <SkLine className="w-[24px]" />
    </div>
  );
}

// ─── Patient portal card (hospital / dept / doctor) ──────────────────────────

export function SkPatientCard({ height = 100 }: { height?: number }) {
  return (
    <div
      className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]"
      style={{ minHeight: height }}
    >
      <div className="flex items-start gap-[12px]">
        <Sk className="size-[40px] rounded-[12px] shrink-0" />
        <div className="flex flex-col gap-[8px] flex-1 min-w-0">
          <SkLine className="w-[120px]" />
          <SkLine className="w-[160px]" />
          <SkLine className="w-[90px]" />
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PAGE-LEVEL SKELETON LAYOUTS
// Each component renders the content area of a specific page while loading.
// ════════════════════════════════════════════════════════════════════════════

// ─── Doctor Dashboard ────────────────────────────────────────────────────────

export function SkDoctorDashboard() {
  return (
    <>
      {/* Welcome row */}
      <div className="flex items-end justify-between flex-wrap gap-3 mb-[20px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[220px] rounded-[6px]" />
          <SkLine className="w-[260px]" />
        </div>
        <Sk className="h-[38px] w-[220px] rounded-[8px] shrink-0" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-[10px] lg:gap-[14px] mb-[20px]">
        <SkStatCard />
        <SkStatCard />
        <SkStatCard />
      </div>

      {/* Two-col layout */}
      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        <div className="flex flex-col gap-[18px] flex-1 min-w-0">
          <SkCurrentPatient />
          {/* Queue preview card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] px-[20px] py-[16px]">
            <div className="flex items-center justify-between flex-wrap gap-[10px] mb-[12px]">
              <div className="flex flex-col gap-[6px]">
                <SkLine className="w-[100px]" />
                <SkLine className="w-[150px]" />
              </div>
              <Sk className="h-[36px] w-[130px] rounded-[10px]" />
            </div>
            {[0, 1, 2].map((i) => <SkQueueRow key={i} />)}
          </div>
        </div>

        {/* Right: doctor status */}
        <div className="bg-white border border-[#d8e1ec] flex flex-col gap-[14px] p-[18px] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] w-full lg:w-[300px] lg:shrink-0">
          <div className="flex flex-col gap-[8px]">
            <SkLine className="w-[100px]" />
            <Sk className="h-[22px] w-[80px] rounded-[999px]" />
          </div>
          <Sk className="h-[56px] rounded-[12px] w-full" />
          <Sk className="h-[38px] rounded-[8px] w-full" />
          <Sk className="h-[48px] rounded-[8px] w-full" />
        </div>
      </div>
    </>
  );
}

// ─── Doctor Queue ─────────────────────────────────────────────────────────────

export function SkDoctorQueue() {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-[24px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[140px] rounded-[6px]" />
          <SkLine className="w-[210px]" />
        </div>
        <Sk className="h-[38px] w-[150px] rounded-[10px]" />
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        <div className="flex-1 min-w-0 flex flex-col gap-[18px]">
          <SkCurrentPatient />
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">
              <SkLine className="w-[100px] mb-[6px]" />
              <SkLine className="w-[170px]" />
            </div>
            {[0, 1, 2, 3, 4].map((i) => <SkQueueRow key={i} />)}
          </div>
        </div>

        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">
          <SkInfoCard rows={5} />
        </div>
      </div>
    </>
  );
}

// ─── Doctor Appointments ──────────────────────────────────────────────────────

export function SkDoctorAppointments() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[160px] rounded-[6px]" />
          <SkLine className="w-[210px]" />
        </div>
        <Sk className="h-[38px] w-[200px] rounded-[8px]" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[24px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#f4f7fb] flex flex-col items-center py-[16px] rounded-[14px] gap-[8px]">
            <Sk className="h-[22px] w-[32px] rounded-[6px]" />
            <SkLine className="w-[60px]" />
          </div>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        {[0, 1, 2, 3, 4].map((i) => <SkAppointmentMobileCard key={i} />)}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block">
        <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
          <div className="grid grid-cols-[80px_1fr_130px_130px_120px_100px] gap-[16px] px-[20px] py-[12px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
            {['Token', 'Patient', 'Time', 'Type', 'Status', 'Action'].map((h) => (
              <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
            ))}
          </div>
          {[0, 1, 2, 3, 4].map((i) => <SkAppointmentTableRow key={i} />)}
        </div>
      </div>
    </>
  );
}

// ─── Patient Details ──────────────────────────────────────────────────────────

export function SkPatientDetails() {
  return (
    <>
      <Sk className="h-[13px] w-[48px] rounded-[4px] mb-[20px]" />

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        <div className="flex flex-col gap-[18px] flex-1 min-w-0">
          {/* Header card */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[24px]">
            <div className="flex gap-[16px] items-start flex-wrap">
              <Sk className="size-[48px] rounded-[999px] shrink-0" />
              <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                <SkLine className="w-[180px]" />
                <SkLine className="w-[140px]" />
                <SkLine className="w-[200px]" />
              </div>
              <Sk className="h-[58px] w-[80px] rounded-[12px] shrink-0" />
            </div>
            <div className="flex flex-wrap gap-[10px] mt-[20px] pt-[18px] border-t border-[#d8e1ec]">
              <Sk className="h-[36px] w-[140px] rounded-[10px]" />
              <Sk className="h-[36px] w-[110px] rounded-[10px]" />
              <Sk className="h-[36px] w-[100px] rounded-[10px]" />
            </div>
          </div>

          {/* Vitals */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">
            <div className="flex items-center gap-[10px] mb-[16px]">
              <Sk className="w-[4px] h-[20px] rounded-[2px] shrink-0" />
              <SkLine className="w-[60px]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-[14px]">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="bg-[#f4f7fb] rounded-[12px] p-[14px] flex flex-col gap-[8px]">
                  <SkLine className="w-[80px]" />
                  <Sk className="h-[20px] w-[50px] rounded-[6px]" />
                </div>
              ))}
            </div>
          </div>

          {/* Medical history */}
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] p-[20px]">
            <div className="flex items-center gap-[10px] mb-[16px]">
              <Sk className="w-[4px] h-[20px] rounded-[2px] shrink-0" />
              <SkLine className="w-[110px]" />
            </div>
            <div className="flex flex-col gap-[8px]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-[10px] py-[8px] border-b border-[#d8e1ec] last:border-0">
                  <Sk className="size-[6px] rounded-full shrink-0" />
                  <SkLine className={`w-[${['200px', '160px', '180px'][i]}]`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[280px] lg:shrink-0 flex flex-col gap-[14px]">
          <SkInfoCard rows={3} />
          <SkInfoCard rows={2} />
          <SkInfoCard rows={2} />
        </div>
      </div>
    </>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export function SkAdminDashboard() {
  return (
    <>
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[20px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[200px] rounded-[6px]" />
          <SkLine className="w-[200px]" />
        </div>
        <Sk className="h-[38px] w-[200px] rounded-[8px]" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-[24px]">
        <SkStatCard />
        <SkStatCard />
        <SkStatCard />
      </div>

      <div className="flex flex-col lg:flex-row gap-[14px] lg:gap-[18px]">
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
            <div className="px-[20px] py-[16px] border-b border-[#d8e1ec] flex items-center justify-between">
              <div className="flex flex-col gap-[6px]">
                <SkLine className="w-[100px]" />
                <SkLine className="w-[140px]" />
              </div>
              <Sk className="h-[32px] w-[130px] rounded-[10px]" />
            </div>
            <div className="grid grid-cols-[1fr_140px_110px_80px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
              {['Doctor', 'Specialization', 'Status', 'Patients'].map((h) => (
                <p key={h} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
              ))}
            </div>
            {[0, 1, 2, 3, 4, 5].map((i) => <SkAdminDoctorRow key={i} />)}
          </div>
        </div>

        <div className="w-full lg:w-[300px] lg:shrink-0 flex flex-col gap-[14px]">
          <SkInfoCard rows={4} />
          <SkInfoCard rows={4} />
        </div>
      </div>
    </>
  );
}

// ─── Doctor Management ────────────────────────────────────────────────────────

export function SkDoctorManagement() {
  return (
    <>
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[190px] rounded-[6px]" />
          <SkLine className="w-[160px]" />
        </div>
        <Sk className="h-[36px] w-[110px] rounded-[10px]" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-[12px] mb-[20px] flex-wrap">
        <Sk className="h-[40px] w-[280px] rounded-[10px]" />
        <div className="flex gap-[6px] flex-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <Sk key={i} className="h-[34px] w-[72px] rounded-[8px]" />
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        <div className="grid grid-cols-[1fr_130px_120px_80px_110px_56px] gap-[16px] px-[20px] py-[10px] bg-[#f4f7fb] border-b border-[#d8e1ec]">
          {['Name', 'Specialization', 'Department', 'Patients', 'Status', ''].map((h, i) => (
            <p key={i} className="font-semibold text-[#7b899c] text-[11px] uppercase">{h}</p>
          ))}
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => <SkDoctorTableRow key={i} />)}
      </div>
    </>
  );
}

// ─── Department Management ────────────────────────────────────────────────────

export function SkDeptManagement() {
  return (
    <>
      <div className="flex flex-wrap items-start gap-[12px] justify-between mb-[24px]">
        <div className="flex flex-col gap-[8px]">
          <Sk className="h-[22px] w-[210px] rounded-[6px]" />
          <SkLine className="w-[180px]" />
        </div>
        <Sk className="h-[36px] w-[130px] rounded-[10px]" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] mb-[24px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-[#f4f7fb] flex flex-col items-center py-[16px] rounded-[14px] gap-[8px]">
            <Sk className="h-[22px] w-[32px] rounded-[6px]" />
            <SkLine className="w-[80px]" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] overflow-hidden">
        <div className="px-[20px] py-[16px] border-b border-[#d8e1ec] flex items-center justify-between">
          <SkLine className="w-[130px]" />
          <Sk className="h-[32px] w-[80px] rounded-[8px]" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-[14px] px-[20px] py-[14px] border-b border-[#d8e1ec] last:border-0">
            <Sk className="size-[32px] rounded-[10px] shrink-0" />
            <div className="flex flex-col gap-[6px] flex-1 min-w-0">
              <SkLine className="w-[120px]" />
              <SkLine className="w-[80px]" />
            </div>
            <Sk className="h-[22px] w-[70px] rounded-[999px] shrink-0" />
            <Sk className="h-[28px] w-[60px] rounded-[8px] shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Patient: Hospital Search ─────────────────────────────────────────────────

export function SkHospitalSearch() {
  return (
    <>
      <div className="flex flex-col gap-[8px] mb-[24px]">
        <Sk className="h-[22px] w-[200px] rounded-[6px]" />
        <SkLine className="w-[260px]" />
      </div>
      <Sk className="h-[44px] w-full rounded-[10px] mb-[20px]" />
      <div className="flex flex-col gap-[12px]">
        {[0, 1, 2, 3].map((i) => <SkPatientCard key={i} height={110} />)}
      </div>
    </>
  );
}

// ─── Patient: Department Selection ───────────────────────────────────────────

export function SkDeptSelect() {
  return (
    <>
      <div className="flex flex-col gap-[8px] mb-[20px]">
        <Sk className="h-[22px] w-[180px] rounded-[6px]" />
        <SkLine className="w-[220px]" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
        {[0, 1, 2, 3, 4, 5].map((i) => <SkPatientCard key={i} height={90} />)}
      </div>
    </>
  );
}

// ─── Patient: Doctor Selection ────────────────────────────────────────────────

export function SkDoctorSelect() {
  return (
    <>
      <div className="flex flex-col gap-[8px] mb-[20px]">
        <Sk className="h-[22px] w-[160px] rounded-[6px]" />
        <SkLine className="w-[200px]" />
      </div>
      <div className="flex flex-col gap-[12px]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white border border-[#d8e1ec] rounded-[14px] p-[20px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
            <div className="flex gap-[14px] items-start mb-[14px]">
              <Sk className="size-[48px] rounded-[999px] shrink-0" />
              <div className="flex flex-col gap-[8px] flex-1 min-w-0">
                <SkLine className="w-[140px]" />
                <SkLine className="w-[100px]" />
                <SkLine className="w-[80px]" />
              </div>
              <Sk className="h-[36px] w-[100px] rounded-[10px] shrink-0" />
            </div>
            <div className="grid grid-cols-3 gap-[8px] pt-[12px] border-t border-[#d8e1ec]">
              {[0, 1, 2].map((j) => (
                <div key={j} className="bg-[#f4f7fb] rounded-[10px] p-[10px] flex flex-col gap-[6px]">
                  <SkLine className="w-[60px]" />
                  <SkLine className="w-[40px]" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Patient: Live Queue ──────────────────────────────────────────────────────

export function SkLiveQueue() {
  return (
    <>
      <div className="flex flex-col gap-[8px] mb-[20px]">
        <Sk className="h-[22px] w-[140px] rounded-[6px]" />
        <SkLine className="w-[200px]" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-[10px] mb-[20px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#d8e1ec] rounded-[14px] p-[16px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)] flex flex-col gap-[8px] items-center">
            <Sk className="h-[22px] w-[32px] rounded-[6px]" />
            <SkLine className="w-[70px]" />
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#d8e1ec] rounded-[14px] shadow-[0px_4px_16px_0px_rgba(19,36,58,0.05)]">
        <div className="px-[20px] py-[16px] border-b border-[#d8e1ec]">
          <SkLine className="w-[100px]" />
        </div>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-[14px] items-center px-[20px] py-[13px] border-b border-[#d8e1ec] last:border-0">
            <Sk className="h-[32px] w-[54px] rounded-[8px] shrink-0" />
            <div className="flex flex-col gap-[6px] flex-1 min-w-0">
              <SkLine className="w-[130px]" />
              <SkLine className="w-[90px]" />
            </div>
            <Sk className="h-[22px] w-[80px] rounded-[999px] shrink-0" />
          </div>
        ))}
      </div>
    </>
  );
}
