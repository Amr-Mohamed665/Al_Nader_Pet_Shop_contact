import Navbar from '@/components/organisms/Navbar';
import Footer from '@/components/organisms/Footer';
import type { ReactNode } from 'react';

interface ShopLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export default function ShopLayout({ children, fullWidth = false }: ShopLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-cream-50">
      <Navbar />
      
      <main className={`flex-grow w-full mx-auto py-8 ${
        fullWidth
          ? 'px-4 sm:px-6 lg:px-8'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8'
      }`}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
