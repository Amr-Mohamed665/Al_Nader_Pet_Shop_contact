'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validators';
import { authService } from '@/services/auth.service';
import AuthLayout from '@/components/templates/AuthLayout';
import GuestRoute from '@/components/guards/GuestRoute';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    setLoading(true);
    setFormError('');
    try {
      const response = await authService.forgotPassword(values.email);
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setFormError(response.message || 'Failed to send reset link. Please try again.');
      }
    } catch (err: any) {
      setFormError(
        err.response?.data?.message || err.message || 'Failed to send password reset request.'
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
              Forgot Password?
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Enter your registered email address and we&apos;ll send you a password reset link.
            </p>
          </div>

          {isSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center gap-2.5 font-extrabold text-emerald-900 text-sm">
                <span className="text-lg">📩</span> Reset Link Sent!
              </div>
              <p className="text-xs font-medium text-emerald-700 leading-relaxed">
                If an account exists with that email, we have sent instructions to reset your password. Please check your inbox and spam folder.
              </p>
              <div className="pt-2 border-t border-emerald-200/60">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-900 hover:underline"
                >
                  <span>←</span> Return to Login
                </Link>
              </div>
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
                  id="email"
                  label="Registered Email Address"
                  register={register}
                  error={errors.email?.message}
                  placeholder="e.g. sara@example.com"
                  type="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full py-3.5 font-extrabold text-xs sm:text-sm uppercase tracking-wider mt-2 bg-gradient-to-br from-[#7C4DDB] to-[#581C87] hover:opacity-95 text-white rounded-2xl shadow-[0_4px_20px_rgba(124,77,219,0.4)] hover:shadow-[0_0_30px_rgba(124,77,219,0.6)] hover:-translate-y-0.5 transition-all duration-300 border-0"
                >
                  Send Reset Link 📧
                </Button>
              </form>
            </>
          )}

          <hr className="border-slate-100" />

          <p className="text-center text-xs text-slate-500">
            Remembered your password?{' '}
            <Link href="/login" className="font-bold text-[#7C4DDB] hover:text-[#581C87] hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </AuthLayout>
    </GuestRoute>
  );
}
