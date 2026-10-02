export interface AdminDoctor {
  id: number;
  name: string;
  specialization: string;
  qualification?: string | null;
  experience?: string | null;
  status: string;
  consultationTime?: string | null;
  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
  department?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

export interface AdminDepartment {
  id: number;
  name: string;
  head?: string | null;
  rooms?: number | null;
  status: string;
  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

export interface AdminAppointment {
  id: number;
  patientName: string;
  patientAge?: number | null;
  patientPhone?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit?: string | null;
  status: string;
  tokenNumber: string;
  priority: string;
  doctor?: {
    id?: number | null;
    name?: string | null;
    specialization?: string | null;
    department?: {
      id?: number | null;
      name?: string | null;
    } | null;
  } | null;
  hospital?: {
    id?: number | null;
    name?: string | null;
  } | null;
}

export interface AdminPayment {
  id: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  refundStatus?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpayRefundId?: string | null;
  createdAt?: string | null;
  paidAt?: string | null;
  refundedAt?: string | null;
}

export interface AdminSettings {
  hospital: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    description: string;
    emergencyAvailable: boolean;
    active: boolean;
  };
  opdStartTime: string;
  opdEndTime: string;
  bookingEnabled: boolean;
  sameDayBookingEnabled: boolean;
  cancellationEnabled: boolean;
  defaultSlotCapacity: number;
  consultationDurationMinutes: number;
  onlinePaymentConfigured: boolean;
  notificationsSupported: boolean;
}