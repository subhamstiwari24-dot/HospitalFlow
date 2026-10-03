import type {
  AdminAppointment,
  AdminDepartment,
  AdminDoctor,
  AdminPayment,
  AdminSettings,
} from '../types/admin';

export interface AdminProfile {
  employeeId: string;
  fullName: string;
  email: string;
  role: 'ADMIN';
  active: boolean;
}

export interface AdminLoginResponse extends AdminProfile {
  token: string;
}

export const ADMIN_TOKEN_KEY = 'hospitalflow_admin_token';

/* ============================================================
   HOSPITAL ADMIN
   ============================================================ */

export interface HospitalAdminLoginResponse {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: 'HOSPITAL_ADMIN';
  hospitalId: number;
}

export interface HospitalAdminProfile {
  message: string;
  email: string;
  role: string;
}

export const HOSPITAL_ADMIN_TOKEN_KEY =
  'hospitalflow_hospital_admin_token';

/* ============================================================
   API ERROR
   ============================================================ */

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

/* ============================================================
   EXISTING ADMIN REQUEST HELPERS
   ============================================================ */

async function requestJson<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    method,
    signal,
    credentials: 'include',
    headers: {
      ...getAuthHeaders(),
      ...(body === undefined
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const responseBody =
        (await response.json()) as {
          message?: string;
        };

      message =
        responseBody.message || message;
    } catch {
      // Use status-based message.
    }

    throw new AdminApiError(
      response.status,
      message,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  return requestJson<T>(
    'GET',
    path,
    undefined,
    signal,
  );
}

function getAuthHeaders(): HeadersInit {
  const token =
    sessionStorage.getItem(
      ADMIN_TOKEN_KEY,
    );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

function requireArray<T>(
  value: unknown,
  resource: string,
): T[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `The ${resource} response was invalid.`,
    );
  }

  return value as T[];
}

/* ============================================================
   EXISTING ADMIN DASHBOARD
   ============================================================ */

export async function getAdminDashboardData(
  signal?: AbortSignal,
) {
  const [
    doctors,
    departments,
    appointments,
  ] = await Promise.all([
    getJson<unknown>(
      '/api/doctors',
      signal,
    ),
    getJson<unknown>(
      '/api/departments',
      signal,
    ),
    getJson<unknown>(
      '/api/appointments',
      signal,
    ),
  ]);

  return {
    doctors: requireArray<AdminDoctor>(
      doctors,
      'doctors',
    ),
    departments:
      requireArray<AdminDepartment>(
        departments,
        'departments',
      ),
    appointments:
      requireArray<AdminAppointment>(
        appointments,
        'appointments',
      ),
  };
}

async function sendJson<T>(
  path: string,
  body?: unknown,
): Promise<T> {
  return requestJson<T>(
    'POST',
    path,
    body,
  );
}

async function patchJson<T>(
  path: string,
): Promise<T> {
  return requestJson<T>(
    'PATCH',
    path,
  );
}

export function loginAdmin(
  employeeId: string,
  password: string,
) {
  return sendJson<AdminLoginResponse>(
    '/api/admin/auth/login',
    {
      employeeId,
      password,
    },
  );
}

export function getAdminProfile(
  signal?: AbortSignal,
) {
  return getJson<AdminProfile>(
    '/api/admin/auth/profile',
    signal,
  );
}

export function logoutAdmin() {
  return sendJson<void>(
    '/api/admin/auth/logout',
  );
}

export function getAdminAppointments(
  signal?: AbortSignal,
) {
  return getJson<AdminAppointment[]>(
    '/api/admin/appointments',
    signal,
  );
}

export function getAdminAppointment(
  id: number,
  signal?: AbortSignal,
) {
  return getJson<AdminAppointment>(
    `/api/admin/appointments/${id}`,
    signal,
  );
}

export function getAdminPayment(
  id: number,
  signal?: AbortSignal,
) {
  return getJson<AdminPayment>(
    `/api/admin/appointments/${id}/payment`,
    signal,
  );
}

export function updateAdminAppointmentStatus(
  id: number,
  status: string,
) {
  return patchJson<AdminAppointment>(
    `/api/admin/appointments/${id}/status?status=${encodeURIComponent(
      status,
    )}`,
  );
}

export function cancelAdminAppointment(
  id: number,
) {
  return sendJson<unknown>(
    `/api/admin/appointments/${id}/cancel`,
  );
}

async function putJson<T>(
  path: string,
  body: unknown,
): Promise<T> {
  return requestJson<T>(
    'PUT',
    path,
    body,
  );
}

export function getAdminSettings(
  signal?: AbortSignal,
) {
  return getJson<AdminSettings>(
    '/api/admin/settings',
    signal,
  );
}

export function updateAdminSettings(
  settings: AdminSettings,
) {
  return putJson<AdminSettings>(
    '/api/admin/settings',
    {
      ...settings,
      ...settings.hospital,
    },
  );
}

export function updateAdminProfile(
  fullName: string,
  email: string,
) {
  return putJson(
    '/api/admin/profile',
    {
      fullName,
      email,
    },
  );
}

export function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
) {
  return sendJson(
    '/api/admin/change-password',
    {
      currentPassword,
      newPassword,
      confirmPassword,
    },
  );
}

/* ============================================================
   HOSPITAL ADMIN REQUEST HELPERS
   ============================================================ */

function getHospitalAdminAuthHeaders(): HeadersInit {
  const token =
    sessionStorage.getItem(
      HOSPITAL_ADMIN_TOKEN_KEY,
    );

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function hospitalAdminRequestJson<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    method,
    signal,
    credentials: 'include',
    headers: {
      ...getHospitalAdminAuthHeaders(),
      ...(body === undefined
        ? {}
        : { 'Content-Type': 'application/json' }),
    },
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const responseBody =
        (await response.json()) as {
          message?: string;
        };

      message =
        responseBody.message || message;
    } catch {
      // Use status-based message.
    }

    throw new AdminApiError(
      response.status,
      message,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* ============================================================
   HOSPITAL ADMIN AUTH
   ============================================================ */

export function loginHospitalAdmin(
  email: string,
  password: string,
) {
  return hospitalAdminRequestJson<HospitalAdminLoginResponse>(
    'POST',
    '/api/hospital-admin/auth/login',
    {
      email,
      password,
    },
  );
}

export function getHospitalAdminProfile(
  signal?: AbortSignal,
) {
  return hospitalAdminRequestJson<HospitalAdminProfile>(
    'GET',
    '/api/hospital-admin/auth/profile',
    undefined,
    signal,
  );
}

/* ============================================================
   HOSPITAL ADMIN DEPARTMENTS
   ============================================================ */

export interface HospitalAdminDepartment {
  id: number;
  name: string;
  head?: string | null;
  rooms?: number | null;
  status: 'Active' | 'Inactive';
  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

export function getHospitalAdminDepartments(
  signal?: AbortSignal,
) {
  return hospitalAdminRequestJson<
    HospitalAdminDepartment[]
  >(
    'GET',
    '/api/hospital-admin/departments',
    undefined,
    signal,
  );
}

export function getHospitalAdminDepartment(
  id: number,
  signal?: AbortSignal,
) {
  return hospitalAdminRequestJson<HospitalAdminDepartment>(
    'GET',
    `/api/hospital-admin/departments/${id}`,
    undefined,
    signal,
  );
}

export function createHospitalAdminDepartment(
  department: {
    name: string;
    head?: string;
    rooms?: number;
    status: 'Active' | 'Inactive';
  },
) {
  return hospitalAdminRequestJson<HospitalAdminDepartment>(
    'POST',
    '/api/hospital-admin/departments',
    department,
  );
}

export function updateHospitalAdminDepartment(
  id: number,
  department: {
    name: string;
    head?: string;
    rooms?: number;
    status: 'Active' | 'Inactive';
  },
) {
  return hospitalAdminRequestJson<HospitalAdminDepartment>(
    'PUT',
    `/api/hospital-admin/departments/${id}`,
    department,
  );
}

export function deleteHospitalAdminDepartment(
  id: number,
) {
  return hospitalAdminRequestJson<void>(
    'DELETE',
    `/api/hospital-admin/departments/${id}`,
  );
}