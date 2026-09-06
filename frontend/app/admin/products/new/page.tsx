'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import ProductForm from '@/components/organisms/ProductForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => productsService.create(data),
    onSuccess: (response) => {
      if (response.success) {
        void queryClient.invalidateQueries({ queryKey: ['products'] });
        router.push('/admin/products');
      } else {
        setError(response.message || 'Failed to create product.');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'An error occurred.');
    },
  });

  const handleSubmit = (data: any) => {
    setError('');
    createMutation.mutate(data);
  };

  const loading = createMutation.isPending;

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Add New Product
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Fill in the product information below.
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold max-w-xl">
              ⚠️ {error}
            </div>
          )}

          <ProductForm onSubmit={handleSubmit} isLoading={loading} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
