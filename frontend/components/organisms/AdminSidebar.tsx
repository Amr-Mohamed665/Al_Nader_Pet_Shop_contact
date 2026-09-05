'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/atoms/Logo';
import { useAuth } from '@/context/AuthContext';
import { ADMIN_NAV_LINKS } from '@/constants/navigation';
import { cn } from '@/utils/cn';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out overflow-hidden',
          'h-dvh min-h-0',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand area with Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 flex-shrink-0">
          <div className="bg-white rounded-xl p-1 shadow-sm border border-white/20 flex items-center justify-center">
            <Logo href="/admin" className="h-8 w-32" />
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <i className="fa-solid fa-xmark text-[16px]"></i>
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="flex-1 min-h-0 overflow-y-auto p-4 space-y-1 pt-5">
          <span className="block px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Administration
          </span>
          {ADMIN_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                isActive(link.href)
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              {link.label === 'Dashboard' && (
                <i className={cn('fa-solid fa-chart-simple mr-2.5 w-4 text-center text-[13px]', isActive(link.href) ? 'text-white' : 'text-slate-500')}></i>
              )}
              {link.label === 'Manage Products' && (
                <i className={cn('fa-solid fa-bone mr-2.5 w-4 text-center text-[13px]', isActive(link.href) ? 'text-white' : 'text-slate-500')}></i>
              )}
              {link.label === 'Manage Categories' && (
                <i className={cn('fa-solid fa-tags mr-2.5 w-4 text-center text-[13px]', isActive(link.href) ? 'text-white' : 'text-slate-500')}></i>
              )}
              {link.label === 'Manage Orders' && (
                <i className={cn('fa-solid fa-truck mr-2.5 w-4 text-center text-[13px]', isActive(link.href) ? 'text-white' : 'text-slate-500')}></i>
              )}
              {link.label === 'Manage Blogs' && (
                <i className={cn('fa-solid fa-newspaper mr-2.5 w-4 text-center text-[13px]', isActive(link.href) ? 'text-white' : 'text-slate-500')}></i>
              )}
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Area */}
        <div className="p-4 border-t border-slate-800 space-y-1 bg-slate-950/20 flex-shrink-0">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center px-3 py-2 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-100 rounded-lg transition-colors"
          >
            <i className="fa-solid fa-house mr-2.5 text-slate-500 w-4 text-center text-[13px]"></i>
            View Website
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg text-left transition-colors"
          >
            <i className="fa-solid fa-right-from-bracket mr-2.5 w-4 text-center text-[13px]"></i>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
