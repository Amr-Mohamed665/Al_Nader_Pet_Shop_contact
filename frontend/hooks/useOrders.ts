'use client';

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { ordersService } from '@/services/orders.service';
import type { Order, OrderStatus } from '@/types';

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetch: UseQueryResult<Order[]>['refetch'];
  deleteOrder: (orderId: string) => Promise<unknown>;
  updateStatus: (vars: { orderId: string; status: OrderStatus }) => Promise<unknown>;
  updatingOrderId: string | null;
}

export default function useOrders(isAdmin = false): UseOrdersReturn {
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();

  const queryKey = ['orders', { isAdmin, userId: user?.id }] as const;

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Order[]> => {
      const response = isAdmin
        ? await ordersService.getAll()
        : await ordersService.getMyOrders();

      if (response.success) {
        return response.data ?? [];
      }
      throw new Error(response.message || 'Failed to fetch orders.');
    },
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => ordersService.delete(orderId),
    onMutate: async (orderId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousOrders = queryClient.getQueryData<Order[]>(queryKey);

      // Optimistically remove the order from the cache
      queryClient.setQueryData<Order[]>(queryKey, (old) =>
        (old ?? []).filter((o) => String(o.id) !== String(orderId))
      );

      return { previousOrders };
    },
    onError: (_err, _orderId, context) => {
      // Roll back to the previous value on error
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKey, context.previousOrders);
      }
    },
    onSettled: () => {
      // Refetch after mutation to ensure server state consistency
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersService.updateStatus(orderId, status),
    onMutate: async ({ orderId, status }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousOrders = queryClient.getQueryData<Order[]>(queryKey);

      // Optimistically update the order status in the cache
      queryClient.setQueryData<Order[]>(queryKey, (old) =>
        (old ?? []).map((o) =>
          String(o.id) === String(orderId) ? { ...o, status } : o
        )
      );

      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(queryKey, context.previousOrders);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    orders: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error.message || 'An error occurred') : null,
    refetch: query.refetch,
    deleteOrder: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    updatingOrderId: updateStatusMutation.isPending
      ? (updateStatusMutation.variables?.orderId ?? null)
      : null,
  };
}
