'use client';

import { useState } from 'react';
import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/atoms/Badge';
import { authService } from '@/services/auth.service';

export default function ProfilePage() {
  const { user } = useAuth();

  // ── Change password state ──────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPwSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(res.message || 'Failed to change password.');
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setPwError(
        axiosError.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setPwLoading(false);
    }
  }

  return (
    <ProtectedRoute>
      <ShopLayout>
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          {/* Header */}
          <div className="border-b border-slate-100 pb-5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Profile
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              View your account details and manage your password.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Avatar Banner */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-800 border-2 border-teal-200 flex items-center justify-center font-bold text-xl select-none">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || (
                  <i className="fa-solid fa-user text-teal-700 text-xl" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900">{user?.name || 'User'}</h2>
                <Badge variant={user?.role === 'admin' ? 'secondary' : 'primary'}>
                  {user?.role === 'admin' ? (
                    <>
                      <i className="fa-solid fa-bolt text-amber-500 mr-1" />
                      Administrator
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-cart-shopping text-purple-600 mr-1" />
                      Customer
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-bold text-slate-800">{user?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-bold text-slate-800">{user?.email || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Account Role</span>
                <p className="text-sm font-bold text-slate-800 capitalize">{user?.role || 'user'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">User ID</span>
                <p className="text-sm font-mono font-bold text-slate-500">{user?.id || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-lock text-purple-600 text-sm" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Change Password</h2>
                <p className="text-xs text-slate-400">Keep your account secure with a strong password.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label htmlFor="current-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showCurrent ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showCurrent ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="new-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2.5 pr-11 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showNew ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showNew ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    className={`w-full px-4 py-2.5 pr-11 text-sm rounded-xl border bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      confirmPassword && confirmPassword !== newPassword
                        ? 'border-rose-300 focus:ring-rose-400/30 focus:border-rose-400'
                        : 'border-slate-200 focus:ring-purple-500/30 focus:border-purple-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    <i className={`fa-solid ${showConfirm ? 'fa-eye-slash' : 'fa-eye'} text-sm`} />
                  </button>
                </div>
                {confirmPassword && confirmPassword !== newPassword && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1">
                    <i className="fa-solid fa-circle-exclamation text-[10px]" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Error / Success feedback */}
              {pwError && (
                <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3">
                  <i className="fa-solid fa-circle-exclamation text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-700 font-medium">{pwError}</p>
                </div>
              )}
              {pwSuccess && (
                <div className="flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-emerald-700 font-medium">Password changed successfully!</p>
                </div>
              )}

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-purple-600/25 transition-all hover:scale-[1.02] active:scale-100"
                >
                  {pwLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-xs" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-key text-xs" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
