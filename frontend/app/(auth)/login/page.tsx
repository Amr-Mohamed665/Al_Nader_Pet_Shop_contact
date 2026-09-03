'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/templates/AuthLayout';
import GuestRoute from '@/components/guards/GuestRoute';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import type { LoginInput } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);
    setFormError('');
    try {
      const response = await login(values);
      if (response.success) {
        router.replace('/');
      } else {
        setFormError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'Incorrect email or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestRoute>
      <AuthLayout>
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Enter your credentials to access your account and orders.
            </p>
          </div>

          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-xs text-rose-700 p-3.5 rounded-xl font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="email"
              label="Email Address"
              register={register}
              error={errors.email?.message}
              placeholder="e.g. sara@example.com"
              type="email"
            />

            <FormField
              id="password"
              label="Password"
              register={register}
              error={errors.password?.message}
              placeholder="••••••••"
              type="password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3.5 font-extrabold shadow-md shadow-teal-500/10 text-xs uppercase tracking-wider mt-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl"
            >
              Sign In 🚪
            </Button>
          </form>

          <hr className="border-slate-100" />

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700 hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestRoute>
  );
}

