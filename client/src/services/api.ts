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
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (userData: SignupFormData): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<ApiResponse<{ message: string }>> => {
    const response: AxiosResponse<ApiResponse<{ message: string }>> = await apiClient.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getUser: async (): Promise<User> => {
    const response: AxiosResponse<User> = await apiClient.get('/auth/user');
    return response.data;
  },

  updateRooms: async (numberOfRooms: number): Promise<ApiResponse<User>> => {
    const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/auth/update-rooms', { number_of_rooms: numberOfRooms });
    return response.data;
  },
};

// Submissions API
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

  applyPenalty: async (submissionId: number, penalty: boolean): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/api/submissions/penalty/${submissionId}`, { penalty });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (): Promise<User[]> => {
    const response: AxiosResponse<User[]> = await apiClient.get('/admin/users');
    return response.data;
  },

  getSubmissions: async (): Promise<SubmissionResponse> => {
    const response: AxiosResponse<SubmissionResponse> = await apiClient.get('/admin/submissions');
    return response.data;
  },

  approveUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/admin/approve/${userId}`);
    return response.data;
  },

  declineUser: async (userId: number, message: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.put(`/admin/decline/${userId}`, { message });
    return response.data;
  },

  deleteUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await apiClient.delete(`/admin/delete/${userId}`);
    return response.data;
  },

  deactivateUser: async (userId: number): Promise<ApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/admin/deactivate/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    return response.json();
  },

  getMonthlyCheckIns: async (year: number): Promise<MonthlyMetrics[]> => {
    const response: AxiosResponse<MonthlyMetrics[]> = await apiClient.get('/admin/monthly-checkins', {
      params: { year }
    });
    return response.data;
  },

  getMonthlyMetrics: async (year: number): Promise<MonthlyMetrics[]> => {
    const response: AxiosResponse<MonthlyMetrics[]> = await apiClient.get('/admin/monthly-metrics', {
      params: { year }
    });
    return response.data;
  },

  getNationalityCounts: async (year: number, month: number): Promise<NationalityCount[]> => {
    const response: AxiosResponse<NationalityCount[]> = await apiClient.get('/admin/nationality-counts', {
      params: { year, month }
    });
    return response.data;
  },

  getGuestDemographics: async (year: number, month: number): Promise<GuestDemographics[]> => {
    const response: AxiosResponse<GuestDemographics[]> = await apiClient.get('/admin/guest-demographics', {
      params: { year, month }
    });
    return response.data;
  },
};

export default apiClient; 