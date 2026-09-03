import api from './api';
import type { ApiResponse, Product } from '@/types';

interface WishlistCheckResponse extends ApiResponse<Product> {
  inWishlist?: boolean;
}

export const wishlistService = {
  async getAll(): Promise<ApiResponse<Product[]>> {
    const { data } = await api.get<ApiResponse<Product[]>>('/wishlist');
    return data;
  },

  async add(productId: string): Promise<ApiResponse<Product>> {
    const { data } = await api.post<ApiResponse<Product>>(`/wishlist/${productId}`);
    return data;
  },

  async remove(productId: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>(`/wishlist/${productId}`);
    return data;
  },

  async check(productId: string): Promise<WishlistCheckResponse> {
    const { data } = await api.get<WishlistCheckResponse>(`/wishlist/${productId}/check`);
    return data;
  },

  async clear(): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>('/wishlist');
    return data;
  },
};
