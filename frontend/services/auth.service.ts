import api from './api';
import type { ApiResponse, AuthResponse, LoginInput, RegisterInput, User } from '@/types';

export const authService = {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', input);
    return data;
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', input);
    return data;
  },

  async getMe(): Promise<ApiResponse<User>> {
    const { data } = await api.get<ApiResponse<User>>('/auth/me');
    return data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    const { data } = await api.patch<ApiResponse>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    const { data } = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const { data } = await api.post<ApiResponse>('/auth/reset-password', { token, password });
    return data;
  },

  async adminResetUserPassword(userId: string, newPassword: string): Promise<ApiResponse> {
    const { data } = await api.patch<ApiResponse>(`/auth/users/${userId}/reset-password`, {
      newPassword,
    });
    return data;
  },
};
