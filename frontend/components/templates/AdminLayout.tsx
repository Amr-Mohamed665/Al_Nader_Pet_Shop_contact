'use client';

import { useState, type ReactNode } from 'react';
import AdminSidebar from '@/components/organisms/AdminSidebar';
import { useAuth } from '@/context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Content Viewport — offset by sidebar width on md+ */}
      <div className="flex-grow md:pl-64 flex flex-col min-h-screen w-0 md:w-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Open sidebar"
            >
              <i className="fa-solid fa-bars text-[18px]"></i>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-slate-400 font-medium text-sm hidden sm:block">Administration</span>
              <span className="text-slate-300 hidden sm:block">/</span>
              <span className="text-slate-800 font-extrabold text-sm tracking-wide truncate">Al Nader Pet Shop</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <span className="hidden sm:block text-xs font-semibold text-slate-500 truncate max-w-[120px]">
                {user.name}
              </span>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-grow overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
