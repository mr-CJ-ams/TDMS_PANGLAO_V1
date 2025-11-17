import axios, { AxiosResponse } from 'axios';
import { 
  User, 
  AuthResponse, 
  Submission, 
  SubmissionResponse, 
  ApiResponse,
  MonthlyMetrics,
  NationalityCount,
  GuestDemographics,
  SignupFormData,
  LoginFormData
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  signup: async (userData: SignupFormData): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/api/auth/signup', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  getUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await apiClient.get('/api/auth/user');
    return response.data;
  },

  updateRooms: async (numberOfRooms: number): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/api/auth/update-rooms', { number_of_rooms: numberOfRooms });
    return response.data;
  },

  // Room names endpoints
  getRoomNames: async (userId: number): Promise<{ roomNames: string[] }> => {
    const response: AxiosResponse<{ roomNames: string[] }> = await apiClient.get(`/api/auth/user/${userId}/room-names`);
    return response.data;
  },

  updateRoomNames: async (userId: number, roomNames: string[]): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post(`/api/auth/user/${userId}/room-names`, { roomNames });
    return response.data;
  },

  // Email verification endpoints
  requestEmailVerification: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/api/auth/request-email-verification', { email });
    return response.data;
  },

  verifyEmail: async (email: string, token: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.get('/api/auth/verify-email', {
      params: { email, token }
    });
    return response.data;
  },

  checkEmailVerification: async (email: string): Promise<ApiResponse<{ verified: boolean }>> => {
    const response: AxiosResponse<ApiResponse<{ verified: boolean }>> = await apiClient.get('/api/auth/check-email-verification', {
      params: { email }
    });
    return response.data;
  },

  // Profile picture upload (if needed elsewhere)
  uploadProfilePicture: async (formData: FormData): Promise<ApiResponse<{ profile_picture: string }>> => {
    const response: AxiosResponse<ApiResponse<{ profile_picture: string }>> = await apiClient.post('/api/auth/upload-profile-picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
};

// Submissions API - UPDATED WITH CORRECT ENDPOINTS
export const submissionsAPI = {
  checkSubmission: async (userId: number, month: number, year: number): Promise<{ hasSubmitted: boolean }> => {
    const response: AxiosResponse<{ hasSubmitted: boolean }> = await apiClient.get('/api/submissions/check-submission', {
      params: { user_id: userId, month, year }
    });
    return response.data;
  },

  getDraft: async (userId: number, month: number, year: number): Promise<{ days: any[] }> => {
    const response: AxiosResponse<{ days: any[] }> = await apiClient.get(`/api/submissions/draft/${userId}/${month}/${year}`);
    return response.data;
  },

  saveDraft: async (userId: number, month: number, year: number, data: any[]): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/api/submissions/draft', {
      userId, month, year, data
    });
    return response.data;
  },

  submit: async (submissionData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/api/submissions/submit', submissionData);
    return response.data;
  },

  getSubmission: async (userId: number, month: number, year: number): Promise<Submission> => {
    const response: AxiosResponse<Submission> = await apiClient.get(`/api/submissions/${userId}/${month}/${year}`);
    return response.data;
  },

  deleteDraft: async (userId: number, month: number, year: number): Promise<void> => {
    await apiClient.delete(`/api/submissions/draft/${userId}/${month}/${year}`);
  },

  getSubmissionDetails: async (submissionId: number): Promise<Submission> => {
    const response: AxiosResponse<Submission> = await apiClient.get(`/api/submissions/details/${submissionId}`);
    return response.data;
  },

  applyPenalty: async (submissionId: string | number, penalty: boolean, accessCode?: string, receiptNumber?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/submissions/penalty/${submissionId}`, { 
      penalty, 
      receipt_number: receiptNumber, 
      access_code: accessCode 
    });
    return response.data;
  },

  // DRAFT STAYS ENDPOINTS - CORRECTED
  getDraftStays: async (userId: number, month?: number, year?: number): Promise<any[]> => {
    let url = `/api/submissions/draft-stays/${userId}`;
    if (month && year) {
      url += `/${month}/${year}`;
    }
    const response: AxiosResponse<any[]> = await apiClient.get(url);
    return response.data;
  },

  createDraftStay: async (stayData: any): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.post('/api/submissions/draft-stays', stayData);
    return response.data;
  },

  deleteDraftStay: async (userId: number, stayId: string): Promise<void> => {
    await apiClient.delete(`/api/submissions/draft-stays/${userId}/${stayId}`);
  },

  deleteDraftStaysByDayRoom: async (userId: number, day: number, month: number, year: number, room: number): Promise<void> => {
    await apiClient.delete(`/api/submissions/draft-stays/${userId}/${day}/${month}/${year}/${room}`);
  },

  getAllDraftStaysForUser: async (userId: number): Promise<any[]> => {
    const response: AxiosResponse<any[]> = await apiClient.get(`/api/submissions/draft-stays/${userId}`);
    return response.data;
  },

  getLastUpdateTimestamp: async (userId: number): Promise<{ lastUpdate: number }> => {
    const response: AxiosResponse<{ lastUpdate: number }> = await apiClient.get(`/api/submissions/last-update/${userId}`);
    return response.data;
  },

  getSubmissionHistory: async (userId: number): Promise<any[]> => {
    const response: AxiosResponse<any[]> = await apiClient.get(`/api/submissions/history/${userId}`);
    return response.data;
  },

  // Add these statistics endpoints
  getUserStatistics: async (userId: number): Promise<any[]> => {
    const response: AxiosResponse<any[]> = await apiClient.get(`/api/submissions/statistics/${userId}`);
    return response.data;
  },

  getUserMonthlyMetrics: async (userId: number, year: number): Promise<any[]> => {
    const response: AxiosResponse<any[]> = await apiClient.get(`/api/submissions/metrics/${userId}`, {
      params: { year }
    });
    return response.data;
  },

  getUserGuestDemographics: async (userId: number, year: number, month: number): Promise<GuestDemographics[]> => {
    const response: AxiosResponse<GuestDemographics[]> = await apiClient.get(`/api/submissions/guest-demographics/${userId}`, {
      params: { year, month }
    });
    return response.data;
  },

  getUserNationalityCounts: async (userId: number, year: number, month: number): Promise<NationalityCount[]> => {
    const response: AxiosResponse<NationalityCount[]> = await apiClient.get(`/api/submissions/nationality-counts/${userId}`, {
      params: { year, month }
    });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await apiClient.get('/api/admin/users');
    return response.data;
  },

  getSubmissions: async (filters?: any, pagination?: any): Promise<SubmissionResponse> => {
    const response: AxiosResponse<SubmissionResponse> = await apiClient.get('/api/admin/submissions', {
      params: { ...filters, ...pagination }
    });
    return response.data;
  },

  approveUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/admin/approve/${userId}`);
    return response.data;
  },

  declineUser: async (userId: number, message: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/admin/decline/${userId}`, { message });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.delete(`/api/admin/delete/${userId}`);
    return response.data;
  },

  deactivateUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/admin/deactivate/${userId}`);
    return response.data;
  },

  getMonthlyCheckIns: async (year: number): Promise<MonthlyMetrics[]> => {
    const response: AxiosResponse<MonthlyMetrics[]> = await apiClient.get('/api/admin/monthly-checkins', {
      params: { year }
    });
    return response.data;
  },

  getMonthlyMetrics: async (year: number): Promise<MonthlyMetrics[]> => {
    const response: AxiosResponse<MonthlyMetrics[]> = await apiClient.get('/api/admin/monthly-metrics', {
      params: { year }
    });
    return response.data;
  },

  getNationalityCounts: async (year: number, month: number): Promise<NationalityCount[]> => {
    const response: AxiosResponse<NationalityCount[]> = await apiClient.get('/api/admin/nationality-counts', {
      params: { year, month }
    });
    return response.data;
  },

  getGuestDemographics: async (year: number, month: number): Promise<GuestDemographics[]> => {
    const response: AxiosResponse<GuestDemographics[]> = await apiClient.get('/api/admin/guest-demographics', {
      params: { year, month }
    });
    return response.data;
  },

  getAutoApproval: async (): Promise<{ enabled: boolean }> => {
    const response: AxiosResponse<{ enabled: boolean }> = await apiClient.get('/api/admin/auto-approval');
    return response.data;
  },

  setAutoApproval: async (enabled: boolean): Promise<{ enabled: boolean }> => {
    const response: AxiosResponse<{ enabled: boolean }> = await apiClient.post('/api/admin/auto-approval', { enabled });
    return response.data;
  },

  updateAccommodation: async (userId: number, accommodationType: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/admin/update-accommodation/${userId}`, { accommodation_type: accommodationType });
    return response.data;
  },

  getVerifiedEmails: async (): Promise<{ email: string }[]> => {
    const response: AxiosResponse<{ email: string }[]> = await apiClient.get('/api/admin/verified-emails');
    return response.data;
  },
};

export default apiClient;