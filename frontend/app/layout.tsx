import { Outfit, Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { SoundProvider } from '@/context/SoundContext';
import QueryProvider from '@/components/guards/QueryProvider';
import WhatsAppFloat from '@/components/atoms/WhatsAppFloat';
import ReduxProvider from '@/components/providers/ReduxProvider';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Al Nader Pet Shop — Premium Pet Supplies',
  description: 'Shop premium food, treats, toys, cages, and accessories for dogs, cats, and birds. Al Nader Pet Shop in Dubai, UAE.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 font-body text-slate-800 antialiased font-medium">
        <ReduxProvider>
          <AuthProvider>
            <SoundProvider>
              <QueryProvider>
                <CartProvider>
                  {children}
                  <WhatsAppFloat />
                </CartProvider>
              </QueryProvider>
            </SoundProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
