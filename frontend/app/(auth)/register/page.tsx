'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validators';
import { useAuth } from '@/context/AuthContext';
import AuthLayout from '@/components/templates/AuthLayout';
import GuestRoute from '@/components/guards/GuestRoute';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import type { RegisterInput } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register: signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);
    setFormError('');
    try {
      const response = await signup(values);
      if (response.success) {
        router.replace('/');
      } else {
        setFormError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'Email might already be registered.'
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
              Create Account
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Join Al Nader Pets to shop products and track your orders.
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
              id="name"
              label="Full Name"
              register={register}
              error={errors.name?.message}
              placeholder="e.g. Sara Ali"
            />

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
              className="w-full py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider mt-2 bg-gradient-to-br from-[#7C4DDB] to-[#581C87] hover:opacity-95 text-white rounded-2xl shadow-[0_4px_20px_rgba(124,77,219,0.4)] hover:shadow-[0_0_30px_rgba(124,77,219,0.6)] hover:-translate-y-0.5 transition-all duration-300 border-0"
            >
              Sign Up 📝
            </Button>
          </form>

          <hr className="border-slate-100" />

          <p className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#7C4DDB] hover:text-[#581C87] hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestRoute>
  );
}

