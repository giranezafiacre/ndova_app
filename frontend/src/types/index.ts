export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED";

export type UserRole = "CLIENT" | "PROVIDER" | "ADMIN";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderService {
  id: string;
  serviceId: string;
  providerId: string;
  location: string;
  description: string;
  stars: number;
  durationMinutes: number;
  imageUrl?: string;
  meetingLink?: string;
  service: Pick<Service, "id" | "name" | "description" | "isActive">;
  provider: Pick<
    User,
    "id" | "firstName" | "lastName" | "email" | "phone"
  >;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  providerId?: string;
  serviceId: string;
  providerServiceId?: string;
  status: AppointmentStatus;
  requestedDate: string;
  requestedTime: string;
  durationMinutes?: number;
  sessionType?: "IN_PERSON" | "ONLINE";
  location?: string;
  meetingLink?: string;
  reason?: string;
  adminNote?: string;
  client?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  provider?: Pick<User, "id" | "firstName" | "lastName" | "email">;
  service?: Pick<Service, "id" | "name">;
  providerService?: Pick<
    ProviderService,
    "id" | "durationMinutes" | "location" | "meetingLink" | "imageUrl"
  >;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentStatusHistory {
  id: string;
  appointmentId: string;
  previousStatus?: AppointmentStatus | null;
  newStatus: AppointmentStatus;
  note?: string | null;
  changedById: string;
  changedBy?: Pick<User, "id" | "firstName" | "lastName">;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: Extract<UserRole, "CLIENT" | "PROVIDER">;
}

export interface AuthData {
  token: string;
  user: User;
}

export interface ClientDashboard {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
  recentAppointments: Appointment[];
}

export interface ProviderDashboard {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
  recentAppointments: Appointment[];
}

export interface AdminDashboard {
  users: { total: number; clients: number; providers: number };
  services: { total: number };
  appointments: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
    completed: number;
  };
  recentAppointments: Appointment[];
}
