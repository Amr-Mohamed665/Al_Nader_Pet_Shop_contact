'use client';

import { useEffect, useState, useCallback } from 'react';
import ShopLayout from '@/components/templates/ShopLayout';
import HeroSection from '@/components/organisms/HeroSection';
import CategoryShowcase from '@/components/organisms/CategoryShowcase';
import FeaturedProducts from '@/components/organisms/FeaturedProducts';
import AboutSection from '@/components/organisms/AboutSection';
import CustomerCarousel from '@/components/organisms/CustomerCarousel';
import BenefitsSection from '@/components/organisms/BenefitsSection';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import { productsService } from '@/services/products.service';

import { useQuery } from '@tanstack/react-query';

const LOADING_MESSAGES = [
  { icon: '🐾', text: 'Connecting to server...' },
  { icon: '⏳', text: 'Almost there, hang tight...' },
  { icon: '🐶', text: 'Waking up the pet shop...' },
  { icon: '🐱', text: 'Loading our furry friends...' },
  { icon: '✨', text: 'Just a few more seconds...' },
];

export default function Home() {
  const [msgIndex, setMsgIndex] = useState(0);

  const featuredQuery = useQuery({
    queryKey: ['featured-homepage-products'],
    queryFn: async (): Promise<any[]> => {
      const [productsRes, featuredRes] = await Promise.all([
        productsService.getAll(),
        productsService.getFeaturedIds(),
      ]);

      if (!productsRes.success) {
        throw new Error(productsRes.message || 'Failed to load products.');
      }

      const allAvailable = productsRes.data.filter((p: any) => p.available !== false);

      let featuredList: any[] = [];
      if (featuredRes.success && featuredRes.data.length > 0) {
        const featuredIdSet = featuredRes.data;
        featuredList = featuredIdSet
          .map((id: string) => allAvailable.find((p: any) => p.id === id))
          .filter(Boolean);
      }

      // Fill up to 8 products if available
      if (featuredList.length < 8) {
        const filled = [...featuredList];
        const filledIds = new Set(filled.map((p: any) => p.id));
        for (const prod of allAvailable) {
          if (filled.length >= 8) break;
          if (!filledIds.has(prod.id)) {
            filled.push(prod);
            filledIds.add(prod.id);
          }
        }
        featuredList = filled;
      }

      return featuredList;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes client memory cache
  });

  const featuredProducts = featuredQuery.data ?? [];
  const loading = featuredQuery.isLoading;
  const error = featuredQuery.error ? (featuredQuery.error.message || 'Failed to fetch catalog.') : null;
  const handleRetry = useCallback(() => {
    featuredQuery.refetch();
  }, [featuredQuery]);

  // Cycle through friendly loading messages every 3 seconds
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <ShopLayout>
      {/* Hero Carousel */}
      <HeroSection />

      {/* Shop by Category */}
      <CategoryShowcase />

      {/* Featured Products */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-6">
          {/* Animated paw print orb */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-20 h-20 rounded-full bg-teal-400/20 animate-ping" />
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
              <span className="text-2xl animate-bounce-subtle">
                {LOADING_MESSAGES[msgIndex].icon}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm font-bold text-slate-700 transition-all duration-500">
              {LOADING_MESSAGES[msgIndex].text}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              This may take a few seconds on first load
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-teal-400 to-teal-600 rounded-full animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      ) : error ? (
        <div className="py-8">
          <ErrorState onRetry={handleRetry} description={error} />
        </div>
      ) : (
        <FeaturedProducts products={featuredProducts} />
      )}

      {/* About Al Nader */}
      <AboutSection />

      {/* Happy Customers Carousel */}
      <CustomerCarousel />

      {/* Why Choose Us */}
      <BenefitsSection />
    </ShopLayout>
  );
}
