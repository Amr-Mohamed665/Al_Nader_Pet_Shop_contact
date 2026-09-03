'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import { cn } from '@/utils/cn';
import type { ReactNode } from 'react';

interface CustomerLayoutProps {
  children: ReactNode;
}

export default function CustomerLayout({ children }: CustomerLayoutProps) {
  const pathname = usePathname();

  const links = [
    { label: 'Order History', href: '/orders', icon: 'fa-solid fa-box' },
    { label: 'Account Profile', href: '/profile', icon: 'fa-solid fa-user' },
  ];

  const isActive = (href: string) => {
    if (href === '/orders') return pathname === '/orders' || pathname.startsWith('/orders/');
    return pathname === href;
  };

  return (
    <ShopLayout>
      <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-start py-4">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-56 flex flex-col gap-1 flex-shrink-0 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <span className="block px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 select-none">
            Manage Account
          </span>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-150',
                isActive(link.href)
                  ? 'bg-teal-50 text-teal-600 font-extrabold border border-teal-100 shadow-sm shadow-teal-500/5'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
              )}
            >
              <i className={cn(link.icon, 'w-4 text-center text-[13px]', isActive(link.href) ? 'text-teal-500' : 'text-slate-400')}></i>
              {link.label}
            </Link>
          ))}
        </aside>

        {/* Content body */}
        <div className="flex-grow w-full min-w-0">
          {children}
        </div>
      </div>
    </ShopLayout>
  );
}
