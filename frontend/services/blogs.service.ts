import api from './api';
import type { ApiResponse, BlogPost, CreateBlogPostInput, UpdateBlogPostInput } from '@/types';

export const blogsService = {
  async getAll(params?: { search?: string; category?: string }): Promise<ApiResponse<BlogPost[]>> {
    try {
      const { data } = await api.get<ApiResponse<BlogPost[]>>('/blogs', { params });
      return data;
    } catch (_) {
      return { success: false, data: [] };
    }
  },

  async getBySlugOrId(slugOrId: string): Promise<ApiResponse<BlogPost | null>> {
    try {
      const { data } = await api.get<ApiResponse<BlogPost>>(`/blogs/${slugOrId}`);
      return data;
    } catch (_) {
      return { success: false, data: null };
    }
  },

  async create(postData: CreateBlogPostInput): Promise<ApiResponse<BlogPost | null>> {
    try {
      const { data } = await api.post<ApiResponse<BlogPost>>('/blogs', postData);
      return data;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.response?.data?.message || 'Failed to create blog post',
      };
    }
  },

  async update(id: string, postData: UpdateBlogPostInput): Promise<ApiResponse<BlogPost | null>> {
    try {
      const { data } = await api.put<ApiResponse<BlogPost>>(`/blogs/${id}`, postData);
      return data;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.response?.data?.message || 'Failed to update blog post',
      };
    }
  },

  async delete(id: string): Promise<ApiResponse<null>> {
    try {
      const { data } = await api.delete<ApiResponse<null>>(`/blogs/${id}`);
      return data;
    } catch (err: any) {
      return {
        success: false,
        data: null,
        message: err.response?.data?.message || 'Failed to delete blog post',
      };
    }
  },
};
