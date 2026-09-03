import api from './api';
import type { ApiResponse, Product, ProductFilters } from '@/types';

export const productsService = {
  async getAll(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    const params: Record<string, string | boolean> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.all) params.all = filters.all;
    const { data } = await api.get<ApiResponse<Product[]>>('/menu', { params });
    return data;
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const { data } = await api.get<ApiResponse<Product>>(`/menu/${id}`);
    return data;
  },

  async create(productData: FormData | Partial<Product>): Promise<ApiResponse<Product>> {
    const { data } = await api.post<ApiResponse<Product>>('/menu', productData);
    return data;
  },

  async update(id: string, productData: FormData | Partial<Product>): Promise<ApiResponse<Product>> {
    const { data } = await api.put<ApiResponse<Product>>(`/menu/${id}`, productData);
    return data;
  },

  async toggleAvailability(id: string, available: boolean): Promise<ApiResponse<Product>> {
    const { data } = await api.put<ApiResponse<Product>>(`/menu/${id}`, { available });
    return data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>(`/menu/${id}`);
    return data;
  },

  async getFeaturedIds(): Promise<ApiResponse<string[]>> {
    const { data } = await api.get<ApiResponse<string[]>>('/featured');
    return data;
  },

  async setFeaturedIds(ids: string[]): Promise<ApiResponse<string[]>> {
    const { data } = await api.put<ApiResponse<string[]>>('/featured', { ids });
    return data;
  },

  async reorder(ids: string[]): Promise<ApiResponse<Product[]>> {
    const { data } = await api.put<ApiResponse<Product[]>>('/menu/reorder', { ids });
    return data;
  },

  async getRecommendedAccessories(id: string): Promise<ApiResponse<Product[]>> {
    const { data } = await api.get<ApiResponse<Product[]>>(`/menu/${id}/recommended-accessories`);
    return data;
  },
};
