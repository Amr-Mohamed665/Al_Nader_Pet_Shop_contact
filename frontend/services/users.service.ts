import api from './api';
import type { ApiResponse, User, UserRole } from '@/types';

export const usersService = {
  async getAll(): Promise<ApiResponse<User[]>> {
    const { data } = await api.get<ApiResponse<User[]>>('/auth/users');
    return data;
  },

  async setRole(id: string, role: UserRole): Promise<ApiResponse<User>> {
    const { data } = await api.patch<ApiResponse<User>>(`/auth/users/${id}/role`, { role });
    return data;
  },

  async deleteUser(id: string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/auth/users/${id}`);
    return data;
  },
};
