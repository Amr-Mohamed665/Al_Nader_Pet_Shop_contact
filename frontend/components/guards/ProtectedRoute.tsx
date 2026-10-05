'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/atoms/Spinner';

interface RouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: RouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const mounted = useRef(false);
  mounted.current = true; // set synchronously during render, no effect needed

  useEffect(() => {
    if (mounted.current && !loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
