import api from './api';
import type { ApiResponse, Item } from '@/types';

interface WishlistCheckResponse extends ApiResponse<Item> {
  inWishlist?: boolean;
}

export const wishlistService = {
  async getAll(): Promise<ApiResponse<Item[]>> {
    const { data } = await api.get<ApiResponse<Item[]>>('/wishlist');
    return data;
  },

  async add(itemId: string): Promise<ApiResponse<Item>> {
    const { data } = await api.post<ApiResponse<Item>>(`/wishlist/${itemId}`);
    return data;
  },

  async remove(itemId: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>(`/wishlist/${itemId}`);
    return data;
  },

  async check(itemId: string): Promise<WishlistCheckResponse> {
    const { data } = await api.get<WishlistCheckResponse>(`/wishlist/${itemId}/check`);
    return data;
  },

  async clear(): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>('/wishlist');
    return data;
  },
};
