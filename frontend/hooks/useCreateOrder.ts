'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { CreateOrderDto, ApiResponse, Order } from '@/types';

export default function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Order>, Error, CreateOrderDto>({
    mutationFn: async (payload: CreateOrderDto) => {
      const res = await ordersService.create(payload as any);
      if (!res.success) {
        throw new Error(res.message || 'Failed to place order.');
      }
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
