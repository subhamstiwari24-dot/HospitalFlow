import type { Patient, Doctor, Appointment, Department, QueuePatient, User, Hospital, OPDSlot } from '../types';

export const currentUser: User = {
  id: 'u1',
  name: 'Dr. Sharma',
  role: 'Doctor',
  specialization: 'General Medicine',
  department: 'Outpatient',
};

export const patients: Patient[] = [
  {
    id: 'p1',
    token: 'A-023',
    initials: 'RS',
    name: 'Rahul Sharma',
    age: 34,
    gender: 'Male',
    consultationType: 'General consultation',
    appointmentTime: '10:30 AM',
    priority: 'Normal',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@email.com',
    bloodGroup: 'B+',
    allergies: ['Penicillin'],
    medicalHistory: ['Hypertension (2021)', 'Seasonal allergies'],
    vitals: { bp: '128/82', pulse: 74, temp: '98.6°F', spo2: 98 },
  },
  {
    id: 'p2',
    token: 'A-024',
    initials: 'PM',
    name: 'Priya Mehta',
    age: 52,
    gender: 'Female',
    consultationType: 'General consultation',
    appointmentTime: '10:45 AM',
    priority: 'Priority',
    phone: '+91 87654 32109',
    email: 'priya.mehta@email.com',
    bloodGroup: 'O+',
    allergies: [],
    medicalHistory: ['Diabetes Type 2', 'Hypothyroidism'],
    vitals: { bp: '140/90', pulse: 82, temp: '99.1°F', spo2: 97 },
  },
  {
    id: 'p3',
    token: 'A-025',
    initials: 'VS',
    name: 'Vikram Singh',
    age: 41,
    gender: 'Male',
    consultationType: 'General consultation',
    appointmentTime: '11:00 AM',
    priority: 'Normal',
    phone: '+91 76543 21098',
    email: 'vikram.singh@email.com',
    bloodGroup: 'A+',
    allergies: ['Sulfa drugs'],
    medicalHistory: ['Lower back pain (chronic)'],
    vitals: { bp: '118/76', pulse: 68, temp: '98.4°F', spo2: 99 },
  },
  {
    id: 'p4',
    token: 'A-026',
    initials: 'NK',
    name: 'Neha Kapoor',
    age: 29,
    gender: 'Female',
    consultationType: 'General consultation',
    appointmentTime: '11:15 AM',
    priority: 'Normal',
    phone: '+91 65432 10987',
    email: 'neha.kapoor@email.com',
    bloodGroup: 'AB-',
    allergies: [],
    medicalHistory: [],
    vitals: { bp: '110/70', pulse: 72, temp: '98.2°F', spo2: 99 },
  },
  {
    id: 'p5',
    token: 'A-027',
    initials: 'AR',
    name: 'Arjun Rao',
    age: 67,
    gender: 'Male',
    consultationType: 'Follow-up',
    appointmentTime: '11:30 AM',
    priority: 'Priority',
    phone: '+91 54321 09876',
    email: 'arjun.rao@email.com',
    bloodGroup: 'O-',
    allergies: ['Aspirin', 'NSAIDs'],
    medicalHistory: ['Coronary artery disease', 'Diabetes Type 2', 'Hypertension'],
    vitals: { bp: '148/94', pulse: 88, temp: '98.8°F', spo2: 96 },
  },
  {
    id: 'p6',
    token: 'A-028',
    initials: 'SG',
    name: 'Sunita Gupta',
    age: 45,
    gender: 'Female',
    consultationType: 'General consultation',
    appointmentTime: '11:45 AM',
    priority: 'Normal',
    phone: '+91 43210 98765',
    email: 'sunita.gupta@email.com',
    bloodGroup: 'B-',
    allergies: [],
    medicalHistory: ['Migraine (chronic)'],
    vitals: { bp: '122/80', pulse: 76, temp: '98.5°F', spo2: 98 },
  },
];

export const queuePatients: QueuePatient[] = patients.map((p, i) => ({
  ...p,
  consultationStatus: i === 0 ? 'In consultation' : 'Waiting',
  waitTime: i * 15,
}));

export const doctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Aditya Sharma',
    specialization: 'General Medicine',
    department: 'Outpatient',
    status: 'Available',
    patients: 12,
    shift: '08:00 – 16:00',
    room: 'Room 204',
    phone: '+91 98765 00001',
    email: 'a.sharma@hospitalflow.in',
  },
  {
    id: 'd2',
    name: 'Dr. Meera Nair',
    specialization: 'Cardiology',
    department: 'Cardiology',
    status: 'Busy',
    patients: 8,
    shift: '09:00 – 17:00',
    room: 'Room 310',
    phone: '+91 98765 00002',
    email: 'm.nair@hospitalflow.in',
  },
  {
    id: 'd3',
    name: 'Dr. Rajiv Patel',
    specialization: 'Orthopaedics',
    department: 'Orthopaedics',
    status: 'On Break',
    patients: 6,
    shift: '08:00 – 16:00',
    room: 'Room 112',
    phone: '+91 98765 00003',
    email: 'r.patel@hospitalflow.in',
  },
  {
    id: 'd4',
    name: 'Dr. Ananya Das',
    specialization: 'Paediatrics',
    department: 'Paediatrics',
    status: 'Available',
    patients: 10,
    shift: '10:00 – 18:00',
    room: 'Room 218',
    phone: '+91 98765 00004',
    email: 'a.das@hospitalflow.in',
  },
  {
    id: 'd5',
    name: 'Dr. Suresh Kumar',
    specialization: 'Dermatology',
    department: 'Dermatology',
    status: 'Offline',
    patients: 0,
    shift: '—',
    room: 'Room 405',
    phone: '+91 98765 00005',
    email: 's.kumar@hospitalflow.in',
  },
];

export const appointments: Appointment[] = [
  {
    id: 'ap1',
    patient: patients[0],
    doctor: doctors[0],
    time: '10:30 AM',
    date: '24 Sep 2026',
    status: 'In Progress',
    type: 'General consultation',
  },
  {
    id: 'ap2',
    patient: patients[1],
    doctor: doctors[0],
    time: '10:45 AM',
    date: '24 Sep 2026',
    status: 'Scheduled',
    type: 'General consultation',
  },
  {
    id: 'ap3',
    patient: patients[2],
    doctor: doctors[0],
    time: '11:00 AM',
    date: '24 Sep 2026',
    status: 'Scheduled',
    type: 'General consultation',
  },
  {
    id: 'ap4',
    patient: patients[3],
    doctor: doctors[0],
    time: '11:15 AM',
    date: '24 Sep 2026',
    status: 'Scheduled',
    type: 'General consultation',
  },
  {
    id: 'ap5',
    patient: patients[4],
    doctor: doctors[0],
    time: '11:30 AM',
    date: '24 Sep 2026',
    status: 'Scheduled',
    type: 'Follow-up',
  },
  {
    id: 'ap6',
    patient: patients[5],
    doctor: doctors[0],
    time: '11:45 AM',
    date: '24 Sep 2026',
    status: 'Scheduled',
    type: 'General consultation',
  },
];

export const departments: Department[] = [
  {
    id: 'dept1',
    name: 'General Medicine',
    head: 'Dr. Aditya Sharma',
    doctors: 8,
    patients: 42,
    rooms: 12,
    status: 'Active',
  },
  {
    id: 'dept2',
    name: 'Cardiology',
    head: 'Dr. Meera Nair',
    doctors: 5,
    patients: 28,
    rooms: 8,
    status: 'Active',
  },
  {
    id: 'dept3',
    name: 'Orthopaedics',
    head: 'Dr. Rajiv Patel',
    doctors: 4,
    patients: 19,
    rooms: 6,
    status: 'Active',
  },
  {
    id: 'dept4',
    name: 'Paediatrics',
    head: 'Dr. Ananya Das',
    doctors: 6,
    patients: 31,
    rooms: 9,
    status: 'Active',
  },
  {
    id: 'dept5',
    name: 'Dermatology',
    head: 'Dr. Suresh Kumar',
    doctors: 3,
    patients: 14,
    rooms: 4,
    status: 'Active',
  },
  {
    id: 'dept6',
    name: 'Neurology',
    head: 'Dr. Priya Iyer',
    doctors: 4,
    patients: 22,
    rooms: 7,
    status: 'Active',
  },
];

export const dashboardStats = {
  waiting: 12,
  priorityPatients: 3,
  todayAppointments: 24,
  nextAppointment: '10:30 AM',
  completed: 18,
  completedPercent: 75,
};

export const adminStats = {
  totalDoctors: 24,
  availableDoctors: 18,
  activePatients: 156,
  totalDepartments: 8,
  todayAppointments: 142,
  completedToday: 98,
};

// ─── Patient-facing mock data ─────────────────────────────────────────────────

export const hospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'North Campus General Hospital',
    location: 'Sector 14, North Campus',
    city: 'New Delhi',
    type: 'Government',
    rating: 4.3,
    departments: 8,
    distance: '0.8 km',
    timing: '08:00 AM – 08:00 PM',
    phone: '+91 11 2345 6789',
    departments_list: ['General Medicine', 'Cardiology', 'Orthopaedics', 'Paediatrics', 'Dermatology', 'Neurology', 'Gynaecology', 'ENT'],
  },
  {
    id: 'h2',
    name: 'City Care Medical Centre',
    location: 'Block 7, Civil Lines',
    city: 'New Delhi',
    type: 'Private',
    rating: 4.6,
    departments: 6,
    distance: '2.1 km',
    timing: '07:00 AM – 10:00 PM',
    phone: '+91 11 9876 5432',
    departments_list: ['General Medicine', 'Cardiology', 'Orthopaedics', 'Dermatology', 'Ophthalmology', 'Dental'],
  },
  {
    id: 'h3',
    name: 'Sunrise Community Hospital',
    location: 'MG Road, East Zone',
    city: 'New Delhi',
    type: 'Trust',
    rating: 4.1,
    departments: 5,
    distance: '3.4 km',
    timing: '08:00 AM – 06:00 PM',
    phone: '+91 11 5555 1234',
    departments_list: ['General Medicine', 'Paediatrics', 'Gynaecology', 'ENT', 'Orthopaedics'],
  },
  {
    id: 'h4',
    name: 'Apollo Specialty Clinic',
    location: 'Ring Road, South Delhi',
    city: 'New Delhi',
    type: 'Private',
    rating: 4.8,
    departments: 10,
    distance: '5.2 km',
    timing: '24 Hours',
    phone: '+91 11 7777 8888',
    departments_list: ['General Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Orthopaedics', 'Urology', 'Nephrology', 'Gastroenterology', 'Endocrinology', 'Psychiatry'],
  },
];

// Doctors available for patient OPD booking (enriched from existing doctors + extras)
export const opdDoctors: Record<string, Array<{
  id: string;
  name: string;
  specialization: string;
  department: string;
  status: 'Available' | 'Busy' | 'On Break';
  room: string;
  experience: string;
  fee: number;
  patientsToday: number;
  queueLength: number;
  nextSlot: string;
  rating: number;
}>> = {
  'General Medicine': [
    { id: 'opd-d1', name: 'Dr. Aditya Sharma', specialization: 'General Medicine', department: 'General Medicine', status: 'Available', room: 'Room 204', experience: '12 yrs', fee: 300, patientsToday: 18, queueLength: 4, nextSlot: '11:30 AM', rating: 4.7 },
    { id: 'opd-d2', name: 'Dr. Kavita Rao', specialization: 'General Physician', department: 'General Medicine', status: 'Busy', room: 'Room 206', experience: '8 yrs', fee: 250, patientsToday: 22, queueLength: 7, nextSlot: '12:00 PM', rating: 4.4 },
    { id: 'opd-d3', name: 'Dr. Mohan Lal', specialization: 'Internal Medicine', department: 'General Medicine', status: 'Available', room: 'Room 208', experience: '15 yrs', fee: 400, patientsToday: 14, queueLength: 2, nextSlot: '11:00 AM', rating: 4.8 },
  ],
  'Cardiology': [
    { id: 'opd-d4', name: 'Dr. Meera Nair', specialization: 'Interventional Cardiologist', department: 'Cardiology', status: 'Available', room: 'Room 310', experience: '16 yrs', fee: 600, patientsToday: 12, queueLength: 3, nextSlot: '11:15 AM', rating: 4.9 },
    { id: 'opd-d5', name: 'Dr. Sanjay Gupta', specialization: 'Cardiac Electrophysiologist', department: 'Cardiology', status: 'On Break', room: 'Room 312', experience: '10 yrs', fee: 550, patientsToday: 9, queueLength: 5, nextSlot: '12:30 PM', rating: 4.5 },
  ],
  'Orthopaedics': [
    { id: 'opd-d6', name: 'Dr. Rajiv Patel', specialization: 'Orthopaedic Surgeon', department: 'Orthopaedics', status: 'Available', room: 'Room 112', experience: '14 yrs', fee: 500, patientsToday: 10, queueLength: 3, nextSlot: '11:00 AM', rating: 4.6 },
    { id: 'opd-d7', name: 'Dr. Pooja Mehta', specialization: 'Sports Medicine', department: 'Orthopaedics', status: 'Available', room: 'Room 114', experience: '7 yrs', fee: 400, patientsToday: 8, queueLength: 1, nextSlot: '10:45 AM', rating: 4.3 },
  ],
  'Paediatrics': [
    { id: 'opd-d8', name: 'Dr. Ananya Das', specialization: 'Paediatric Specialist', department: 'Paediatrics', status: 'Available', room: 'Room 218', experience: '11 yrs', fee: 400, patientsToday: 16, queueLength: 6, nextSlot: '11:45 AM', rating: 4.7 },
    { id: 'opd-d9', name: 'Dr. Ravi Kumar', specialization: 'Neonatologist', department: 'Paediatrics', status: 'Busy', room: 'Room 220', experience: '9 yrs', fee: 350, patientsToday: 11, queueLength: 4, nextSlot: '12:00 PM', rating: 4.4 },
  ],
  'Dermatology': [
    { id: 'opd-d10', name: 'Dr. Suresh Kumar', specialization: 'Dermatologist', department: 'Dermatology', status: 'Available', room: 'Room 405', experience: '13 yrs', fee: 450, patientsToday: 7, queueLength: 2, nextSlot: '11:00 AM', rating: 4.5 },
  ],
  'Neurology': [
    { id: 'opd-d11', name: 'Dr. Priya Iyer', specialization: 'Neurologist', department: 'Neurology', status: 'Available', room: 'Room 302', experience: '18 yrs', fee: 700, patientsToday: 8, queueLength: 2, nextSlot: '11:30 AM', rating: 4.9 },
    { id: 'opd-d12', name: 'Dr. Arjun Nambiar', specialization: 'Epileptologist', department: 'Neurology', status: 'Busy', room: 'Room 304', experience: '9 yrs', fee: 600, patientsToday: 6, queueLength: 4, nextSlot: '01:00 PM', rating: 4.6 },
  ],
  'Gynaecology': [
    { id: 'opd-d13', name: 'Dr. Sunita Reddy', specialization: 'Gynaecologist & Obstetrician', department: 'Gynaecology', status: 'Available', room: 'Room 510', experience: '14 yrs', fee: 500, patientsToday: 13, queueLength: 3, nextSlot: '11:15 AM', rating: 4.8 },
  ],
  'ENT': [
    { id: 'opd-d14', name: 'Dr. Vikram Sood', specialization: 'ENT Specialist', department: 'ENT', status: 'Available', room: 'Room 208', experience: '10 yrs', fee: 400, patientsToday: 15, queueLength: 5, nextSlot: '11:45 AM', rating: 4.5 },
  ],
  'Ophthalmology': [
    { id: 'opd-d15', name: 'Dr. Lalitha Menon', specialization: 'Ophthalmologist', department: 'Ophthalmology', status: 'Available', room: 'Room 610', experience: '12 yrs', fee: 450, patientsToday: 10, queueLength: 3, nextSlot: '11:00 AM', rating: 4.7 },
  ],
  'Dental': [
    { id: 'opd-d16', name: 'Dr. Amit Joshi', specialization: 'Dental Surgeon', department: 'Dental', status: 'Available', room: 'Room 120', experience: '8 yrs', fee: 350, patientsToday: 12, queueLength: 2, nextSlot: '10:45 AM', rating: 4.4 },
  ],
};

export const opdSlots: OPDSlot[] = [
  { time: '09:00 AM', available: false, remaining: 0 },
  { time: '09:30 AM', available: false, remaining: 0 },
  { time: '10:00 AM', available: false, remaining: 0 },
  { time: '10:30 AM', available: true, remaining: 2 },
  { time: '11:00 AM', available: true, remaining: 4 },
  { time: '11:30 AM', available: true, remaining: 6 },
  { time: '12:00 PM', available: true, remaining: 8 },
  { time: '12:30 PM', available: true, remaining: 5 },
  { time: '02:00 PM', available: true, remaining: 10 },
  { time: '02:30 PM', available: true, remaining: 10 },
  { time: '03:00 PM', available: true, remaining: 10 },
  { time: '03:30 PM', available: true, remaining: 7 },
];

// Live patient queue tokens for display on patient-facing screens
export const liveQueueTokens = [
  { token: 'A-019', status: 'Completed' as const },
  { token: 'A-020', status: 'Completed' as const },
  { token: 'A-021', status: 'Completed' as const },
  { token: 'A-022', status: 'Completed' as const },
  { token: 'A-023', status: 'In consultation' as const },
  { token: 'A-024', status: 'Waiting' as const },
  { token: 'A-025', status: 'Waiting' as const },
  { token: 'A-026', status: 'Waiting' as const },
  { token: 'A-027', status: 'Waiting' as const },
  { token: 'A-028', status: 'Waiting' as const },
];
