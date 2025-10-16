// types.ts
export interface CheckInData {
  month: number;
  total_check_ins: number;
  isPredicted?: boolean;
}

export interface MonthlyMetric {
  month: number;
  total_check_ins: number;
  total_overnight: number;
  total_occupied: number;
  average_guest_nights: number;
  average_room_occupancy_rate: number;
  average_guests_per_room: number;
  total_submissions: number;
  submission_rate: number;
  total_rooms: number;
}

export interface GuestDemographic {
  gender: string;
  age_group: string;
  status: string;
  count: number;
}

export interface NationalityCount {
  nationality: string;
  count: number;
  male_count: number;
  female_count: number;
}

export interface User {
  // Define your user properties here
  [key: string]: any;
}
