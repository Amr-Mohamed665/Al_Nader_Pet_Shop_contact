import api from './api';
import type { ApiResponse, Category, CreateCategoryInput, UpdateCategoryInput } from '@/types';

export const categoriesService = {
  async getAll(): Promise<ApiResponse<Category[]>> {
    try {
      const { data } = await api.get<ApiResponse<Category[]>>('/categories');
      return data;
    } catch (_) {
      return { success: false, data: [] };
    }
  },

  async getById(id: string): Promise<ApiResponse<Category | null>> {
    try {
      const { data } = await api.get<ApiResponse<Category>>(`/categories/${id}`);
      return data;
    } catch (_) {
      return { success: false, data: null };
    }
  },

  async create(categoryData: CreateCategoryInput): Promise<ApiResponse<Category | null>> {
    try {
      const { data } = await api.post<ApiResponse<Category>>('/categories', categoryData);
      return data;
    } catch (_) {
      return { success: false, data: null };
    }
  },

  async update(id: string, categoryData: UpdateCategoryInput): Promise<ApiResponse<Category | null>> {
    try {
      const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, categoryData);
      return data;
    } catch (_) {
      return { success: false, data: null };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { data } = await api.delete<ApiResponse<void>>(`/categories/${id}`);
      return data;
    } catch (_) {
      return { success: false };
    }
  },

  async reorder(orderedIds: string[]): Promise<ApiResponse<void>> {
    try {
      const { data } = await api.put<ApiResponse<void>>('/categories/reorder', { orderedIds });
      return data;
    } catch (_) {
      return { success: false };
    }
  },

  async getChildren(id: string): Promise<ApiResponse<Category[]>> {
    try {
      const { data } = await api.get<ApiResponse<Category[]>>(`/categories/${id}/children`);
      return data;
    } catch (_) {
      return { success: false, data: [] };
    }
  },
};
