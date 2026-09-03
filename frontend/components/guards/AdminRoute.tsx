'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/atoms/Spinner';

interface RouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: RouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (mounted.current && !loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isAdmin) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return isAuthenticated && isAdmin ? <>{children}</> : null;
}
