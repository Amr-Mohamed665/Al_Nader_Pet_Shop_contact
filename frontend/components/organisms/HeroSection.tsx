'use client';

import Image from 'next/image';
import Link from 'next/link';

interface TrustBadge {
  iconClass: string;
  label: string;
  sub: string;
}

export default function HeroSection() {
  const trustBadges: TrustBadge[] = [
    { iconClass: 'fa-solid fa-shield-halved', label: 'Health', sub: 'Guarantee' },
    { iconClass: 'fa-solid fa-award', label: 'Premium', sub: 'Quality' },
    { iconClass: 'fa-solid fa-truck', label: 'Fast & Safe', sub: 'Delivery' },
  ];

  return (
    <section
      className="relative w-full overflow-hidden rounded-3xl mb-10 sm:mb-12 animate-hero-fade"
      style={{ minHeight: '280px' }}
      aria-label="Hero section"
    >
      {/* ── Background Image ── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/puppies-hero.jpg"
          alt="Pet shop hero background"
          fill
          className="object-contain object-center"
          sizes="100vw"
          priority
          unoptimized
        />
        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,7,30,0.92) 0%, rgba(42,21,88,0.88) 40%, rgba(63,30,115,0.75) 70%, rgba(15,7,30,0.70) 100%)',
          }}
        />
      </div>

      {/* ── Decorative glowing orbs ── */}
      <div
        aria-hidden="true"
        className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(124,77,219,0.35) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(245,166,35,0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 right-[15%] w-[250px] h-[250px] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(46,196,182,0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
          transform: 'translateY(-50%)',
        }}
      />

      {/* ── Main Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 py-20 sm:py-28 lg:py-36">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 animate-fade-in-up"
          style={{
            background: 'rgba(124,77,219,0.18)',
            borderColor: 'rgba(155,114,242,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <i className="fa-solid fa-wand-magic-sparkles text-purple-300 text-[14px]"></i>
          <span className="text-xs sm:text-sm font-semibold text-purple-200 tracking-wide">
            Premium Pet Care — Est. 2018
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-tight mb-5 animate-fade-in-up text-white"
          style={{ color: '#ffffff', textShadow: '0 4px 30px rgba(0,0,0,0.4)' }}
        >
          <span className="text-white" style={{ color: '#ffffff' }}>Where Pets Become{' '}</span>
          <span
            className="bg-gradient-to-r from-purple-300 via-purple-400 to-amber-400 bg-clip-text text-transparent"
          >
            Family
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl mb-9 animate-fade-in-up"
        >
          Discover premium companions, top-quality food, and everything your pet
          needs for a happy, healthy life — all in one place.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-wrap items-center justify-center gap-4 mb-14 animate-fade-in-up"
        >
          <Link
            href="/products"
            id="hero-shop-now"
            className="group inline-flex items-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold text-white rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(124,77,219,0.6)] bg-gradient-to-br from-[#7C4DDB] to-[#581C87] shadow-[0_4px_20px_rgba(124,77,219,0.4)]"
          >
            Shop Now
            <i className="fa-solid fa-arrow-right text-[16px] transition-transform duration-300 group-hover:translate-x-1"></i>
          </Link>
        </div>

        {/* Trust Badges */}
        <div
          className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-lg animate-fade-in-up"
        >
          {trustBadges.map(({ iconClass, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-purple-500/20"
              >
                <i className={`${iconClass} text-[18px] text-purple-300`}></i>
              </div>
              <div className="flex flex-col items-center leading-none">
                <span className="text-xs sm:text-sm font-extrabold text-white">{label}</span>
                <span className="text-[10px] sm:text-xs text-slate-400 mt-0.5">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom fade-to-page ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10 bg-gradient-to-b from-transparent to-cream-50"
      />
    </section>
  );
}
