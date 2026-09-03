import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/atoms/Logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/70 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full flex flex-col items-center gap-4">
        {/* Logo - Above the card, on its own */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo className="scale-150 hover:scale-[1.6]" />
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[11px]">
              Customer Portal
            </span>
            <span className="text-slate-300">•</span>
            <span className="font-extrabold text-slate-400 uppercase tracking-widest text-[11px]">
              Back to Storefront
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden bg-white">

        {/* Bottom Row - 2 Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column - Form Content */}
          <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
            {children}
          </div>

          {/* Right Column - Hero Banner */}
          <div className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-8 lg:p-12 text-white overflow-hidden">
            {/* Background Image - same as HeroSection */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/images/alnader-hero.jpg"
                alt="Al Nader Pets Hero"
                fill
                className="object-cover object-center"
                priority
                unoptimized
              />
              {/* Dark overlay gradient - matches HeroSection exactly */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(15,7,30,0.92) 0%, rgba(42,21,88,0.88) 40%, rgba(63,30,115,0.75) 70%, rgba(15,7,30,0.70) 100%)',
                }}
              />
            </div>

            {/* Decorative glowing orbs - matches HeroSection */}
            <div
              aria-hidden="true"
              className="absolute top-[-60px] left-[-60px] w-[300px] h-[300px] rounded-full pointer-events-none z-0"
              style={{
                background: 'radial-gradient(circle, rgba(124,77,219,0.35) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />
            <div
              aria-hidden="true"
              className="absolute bottom-[-40px] right-[-40px] w-[250px] h-[250px] rounded-full pointer-events-none z-0"
              style={{
                background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)',
                filter: 'blur(40px)',
              }}
            />

            {/* Hero Content */}
            <div className="relative z-10 space-y-6 my-auto py-8">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold px-3.5 py-1 rounded-full shadow-sm">
                <span>🐾 Welcome</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Your Choice for Healthy & Happy Pets
              </h1>

              <p className="text-purple-100 text-sm leading-relaxed max-w-md">
                Discover premium pet food, healthcare items, toys, and luxury accessories curated specifically for your pets.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-lg">🐶</span>
                  <span className="text-xs font-medium text-white">Healthy Pets</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-lg">🚀</span>
                  <span className="text-xs font-medium text-white">Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-lg">✨</span>
                  <span className="text-xs font-medium text-white">Premium Quality</span>
                </div>
                <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  <span className="text-lg">🛡️</span>
                  <span className="text-xs font-medium text-white">24/7 Care</span>
                </div>
              </div>
            </div>

            {/* Subtle Footer Note */}
            <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-purple-200/80">
              © {new Date().getFullYear()} Al Nader Pets & Accessories. All rights reserved.
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}





