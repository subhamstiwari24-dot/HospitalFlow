export type DoctorStatus = 'Available' | 'Busy' | 'On Break' | 'Offline';
export type ConsultationStatus = 'In consultation' | 'Waiting' | 'Completed' | 'Skipped';
export type AppointmentStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type PatientPriority = 'Normal' | 'Priority' | 'Urgent';

export interface Patient {
  id: string;
  token: string;
  initials: string;
  name: string;
  age: number;
  gender: string;
  consultationType: string;
  appointmentTime: string;
  priority: PatientPriority;
  phone?: string;
  email?: string;
  bloodGroup?: string;
  allergies?: string[];
  medicalHistory?: string[];
  vitals?: {
    bp: string;
    pulse: number;
    temp: string;
    spo2: number;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department: string;
  status: DoctorStatus;
  patients: number;
  shift: string;
  room: string;
  avatar?: string;
  phone?: string;
  email?: string;
}

export interface Appointment {
  id: string;
  patient: Patient;
  doctor: Doctor;
  time: string;
  date: string;
  status: AppointmentStatus;
  type: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  doctors: number;
  patients: number;
  rooms: number;
  status: 'Active' | 'Inactive';
}

export interface QueuePatient extends Patient {
  consultationStatus: ConsultationStatus;
  waitTime: number;
}

export interface User {
  id: string;
  name: string;
  role: 'Doctor' | 'Admin' | 'Nurse';
  specialization?: string;
  department?: string;
  avatar?: string;
}

// ─── Patient-facing types ─────────────────────────────────────────────────────

export interface Hospital {
  id: string;
  name: string;
  location: string;
  city: string;
  type: 'Government' | 'Private' | 'Trust';
  rating: number;
  departments: number;
  distance: string;
  timing: string;
  phone: string;
  departments_list: string[];
}

export interface OPDSlot {
  time: string;
  available: boolean;
  remaining: number;
}

export interface PatientBooking {
  bookingId: string;
  token: string;
  tokenNumber: number;
  hospitalId: string;
  hospitalName: string;
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorRoom: string;
  date: string;
  slot: string;
  bookedAt: string;
  status: 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  patientsAhead: number;
  currentServing: string;
  avgWaitMinutes: number;
}
