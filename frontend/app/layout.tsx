import { Outfit, Inter, Caveat, Dancing_Script, Great_Vibes, Satisfy } from 'next/font/google';
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

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  display: 'swap',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-handwriting-fancy',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-great-vibes',
  display: 'swap',
});

const satisfy = Satisfy({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-satisfy',
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
      className={`${outfit.variable} ${inter.variable} ${caveat.variable} ${dancingScript.variable} ${greatVibes.variable} ${satisfy.variable} h-full scroll-smooth`}
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
