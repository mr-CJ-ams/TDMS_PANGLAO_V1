// Core TDMS Type Definitions

// User Types
export interface User {
  user_id: number;
  username: string;
  email: string;
  establishment_name: string;
  number_of_rooms: number;
  region: string;
  province: string;
  municipality: string;
  barangay: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Guest Types
export interface Guest {
  name: string;
  age: number;
  nationality: string;
  isCheckIn: boolean;
}

// Room Occupancy Types
export interface RoomOccupancy {
  day: number;
  room: number;
  guests: Guest[];
  lengthOfStay: number;
  isCheckIn: boolean;
  stayId?: string;
  startDay?: number;
}

// Submission Types
export interface Submission {
  submission_id: number;
  user_id: number;
  month: number;
  year: number;
  days: RoomOccupancy[];
  is_submitted: boolean;
  is_approved: boolean;
  penalty: boolean;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SubmissionResponse {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
}

// Form Types
export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  establishment_name: string;
  number_of_rooms: number;
  region: string;
  province: string;
  municipality: string;
  barangay: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

// Dashboard Types
export interface MonthlyMetrics {
  month: number;
  total_check_ins: number;
  total_overnight: number;
  average_guest_nights: number;
  average_room_occupancy: number;
  average_guests_per_room: number;
}

export interface NationalityCount {
  nationality: string;
  count: number;
  percentage: number;
}

export interface GuestDemographics {
  age_group: string;
  count: number;
  percentage: number;
}

// Component Props Types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

export interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (day: number, room: number, guestData: GuestModalData) => void;
  day: number;
  room: number;
  initialData?: RoomOccupancy;
}

export interface GuestModalData {
  guests: Guest[];
  lengthOfStay: string;
  isCheckIn: boolean;
}

// Utility Types
export type MonthYear = {
  month: number;
  year: number;
};

export type RoomConflict = {
  hasConflict: boolean;
  month?: number;
  year?: number;
  conflictingRoom?: number;
}; 
