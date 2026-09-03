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
};
