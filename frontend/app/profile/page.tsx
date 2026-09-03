'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import ProtectedRoute from '@/components/guards/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Badge from '@/components/atoms/Badge';

export default function ProfilePage() {
  const { user } = useAuth();

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
              View your account details below.
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
            {/* Avatar Banner */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-full bg-teal-100 text-teal-800 border-2 border-teal-200 flex items-center justify-center font-bold text-xl select-none">
                {user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '👤'}
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900">{user?.name || 'User'}</h2>
                <Badge variant={user?.role === 'admin' ? 'secondary' : 'primary'}>
                  {user?.role === 'admin' ? '⚡ Administrator' : '🛒 Customer'}
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
        </div>
      </ShopLayout>
    </ProtectedRoute>
  );
}
