'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validators';
import { authService } from '@/services/auth.service';
import AuthLayout from '@/components/templates/AuthLayout';
import GuestRoute from '@/components/guards/GuestRoute';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    if (!token) {
      setFormError('Invalid or missing password reset token. Please request a new link.');
      return;
    }

    setLoading(true);
    setFormError('');
    try {
      const response = await authService.resetPassword(token, values.password);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setFormError(response.message || 'Failed to reset password. Token may have expired.');
      }
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'Failed to reset password. Please try requesting a new link.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token && !isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-900">Invalid Link</h2>
          <p className="text-xs text-slate-500 font-medium">
            This password reset link is invalid or incomplete.
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 text-xs text-rose-700 p-4 rounded-2xl font-semibold space-y-2">
          <div className="flex items-center gap-2">
            <span>⚠️</span> Missing Reset Token
          </div>
          <p className="text-rose-600 font-medium leading-relaxed">
            Please make sure you copied the full link from your email, or request a new password reset link below.
          </p>
        </div>

        <Link
          href="/forgot-password"
          className="block w-full py-3 text-center bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
        >
          Request New Reset Link
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Password
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Create a new, strong password for your account.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl space-y-4 animate-fade-in">
          <div className="flex items-center gap-2.5 font-extrabold text-emerald-900 text-sm">
            <span className="text-xl">✅</span> Password Reset Complete!
          </div>
          <p className="text-xs font-medium text-emerald-700 leading-relaxed">
            Your password has been successfully updated. You can now log in using your new credentials.
          </p>
          <Button
            type="button"
            variant="primary"
            onClick={() => router.push('/login')}
            className="w-full py-3 font-extrabold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md border-0"
          >
            Go to Login 🚪
          </Button>
        </div>
      ) : (
        <>
          {formError && (
            <div className="bg-rose-50 border border-rose-200 text-xs text-rose-700 p-3.5 rounded-xl font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              id="password"
              label="New Password"
              register={register}
              error={errors.password?.message}
              placeholder="At least 6 characters"
              type="password"
            />

            <FormField
              id="confirmPassword"
              label="Confirm New Password"
              register={register}
              error={errors.confirmPassword?.message}
              placeholder="Re-enter your new password"
              type="password"
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider mt-2 bg-gradient-to-br from-[#7C4DDB] to-[#581C87] hover:opacity-95 text-white rounded-2xl shadow-[0_4px_20px_rgba(124,77,219,0.4)] hover:shadow-[0_0_30px_rgba(124,77,219,0.6)] hover:-translate-y-0.5 transition-all duration-300 border-0"
            >
              Update Password 🔐
            </Button>
          </form>
        </>
      )}

      <hr className="border-slate-100" />

      <p className="text-center text-xs text-slate-500">
        Back to{' '}
        <Link href="/login" className="font-bold text-[#7C4DDB] hover:text-[#581C87] hover:underline">
          Login Page
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestRoute>
      <AuthLayout>
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold">Loading...</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </AuthLayout>
    </GuestRoute>
  );
}
