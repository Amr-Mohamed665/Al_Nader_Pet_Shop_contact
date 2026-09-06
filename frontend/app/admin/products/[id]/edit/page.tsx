'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import ProductForm from '@/components/organisms/ProductForm';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import useProduct from '@/hooks/useProduct';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { product, loading: fetchLoading, error: fetchError, refetch } = useProduct(id);
  const [submitError, setSubmitError] = useState('');

  const updateMutation = useMutation({
    mutationFn: (data: any) => productsService.update(id!, data),
    onSuccess: (response) => {
      if (response.success) {
        void queryClient.invalidateQueries({ queryKey: ['products'] });
        void queryClient.invalidateQueries({ queryKey: ['product', id] });
        router.push('/admin/products');
      } else {
        setSubmitError(response.message || 'Failed to update product.');
      }
    },
    onError: (err: any) => {
      setSubmitError(err.response?.data?.message || err.message || 'An error occurred.');
    },
  });

  const handleSubmit = (data: any) => {
    setSubmitError('');
    updateMutation.mutate(data);
  };

  const submitLoading = updateMutation.isPending;

  if (fetchLoading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="min-h-[50vh] flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (fetchError || !product) {
    return (
      <AdminRoute>
        <AdminLayout>
          <ErrorState title="Product not found" description={fetchError ?? undefined} onRetry={refetch} />
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Edit Product
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Editing: <strong className="text-slate-700">{product.name}</strong>
            </p>
          </div>

          {submitError && (
            <div className="bg-rose-50 border border-rose-100 text-xs text-rose-600 p-4 rounded-xl font-bold max-w-xl">
              ⚠️ {submitError}
            </div>
          )}

          <ProductForm
            initialValues={{
              name: product.name || '',
              category: product.category || '',
              price: product.price || '',
              description: product.description || '',
              image: product.image || '',
              available: product.available !== false,
            }}
            onSubmit={handleSubmit}
            isLoading={submitLoading}
          />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
