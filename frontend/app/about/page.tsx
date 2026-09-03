'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import Image from 'next/image';
import { CONTACT_INFO } from '@/constants/navigation';

export default function AboutPage() {
  return (
    <ShopLayout>
      <div className="space-y-12 sm:space-y-16 animate-fade-in max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-[#2A1558] text-white p-8 sm:p-12 md:p-16 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/25 border border-purple-400/35 rounded-full text-xs font-bold text-purple-200 tracking-wider">
               ABOUT AL NADER PET SHOP
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Bridging Hearts and <span className="text-[#F5A623]">Paws</span>
            </h1>
            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-medium">
              UAE&apos;s premier destination for high-quality pet supplies, healthy food, and accessories since 2018.
            </p>
          </div>
          {/* Background glowing design */}
          <div className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        </section>

        {/* Company Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
          <div className="relative aspect-square md:aspect-auto md:h-[350px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-6">
            <Image
              src="/images/alnader-logo.jpg"
              alt="Al Nader Pet Shop logo"
              fill
              className="object-contain p-6"
              unoptimized
            />
          </div>
          <div className="space-y-5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Our Journey & <span className="text-purple-600">Company Story</span>
            </h2>
            <div className="space-y-4 text-slate-600 text-sm font-medium leading-relaxed">
              <p>
                Founded in the heart of Dubai, UAE, <strong>Al Nader Pets &amp; Accessories Trading L.L.C</strong> began with a single mission: to elevate the quality of life for our beloved pet companions.
              </p>
              <p>
                What started as a passionate dream has grown into a trusted community pet shop. Over the years, we have built strong relationships with top-tier global suppliers to offer only the best pet food, cages, beds, toys, and grooming products.
              </p>
              <p>
                We believe that pets are more than just animals — they are core family members. That is why our products undergo rigorous selection to ensure safety, nutritional value, and ultimate happiness.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-[#FFF5EC] border border-[#FFE4CC] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEBD6] flex items-center justify-center">
              <i className="fa-solid fa-bullseye text-[#E8961C] text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Our Mission</h3>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
              To provide pet owners in the UAE with exceptional customer service and premium-quality, health-first supplies that nurture the lifelong bond between families and their pets.
            </p>
          </div>

          <div className="bg-[#EBFDFB] border border-[#C8F7F3] rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D5FAF6] flex items-center justify-center">
              <i className="fa-solid fa-eye text-[#179E91] text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Our Vision</h3>
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
              To become the leading and most trusted name in pet supplies across the Middle East, recognized for our commitment to animal welfare, quality assurance, and community education.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="space-y-8 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm text-center">
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Why Choose Al Nader?</h2>
            <p className="text-slate-400 text-xs font-semibold">WE STAND OUT BY OFFERING EXCELLENCE</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-shield-halved text-lg"></i>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Certified Safe Products</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">All our supplies are sourced directly from trusted manufacturers and thoroughly checked for quality.</p>
            </div>
            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-truck text-lg"></i>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Fast Delivery in UAE</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">We deliver straight to your doorstep with speed and security, keeping your pet&apos;s needs satisfied without delay.</p>
            </div>
            <div className="space-y-2 p-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <i className="fa-solid fa-headset text-lg"></i>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">Expert Friendly Support</h4>
              <p className="text-slate-500 text-xs leading-relaxed font-medium">Our knowledgeable and caring staff are always ready to assist you in selecting the perfect items for your pet.</p>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Need Assistance?</h3>
              <p className="text-slate-400 text-xs sm:text-sm font-medium leading-relaxed">
                Have questions about our supplies or need help choosing? Reach out to our team today!
              </p>
            </div>
            <div className="space-y-3.5 text-xs sm:text-sm font-medium">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
                  <i className="fa-solid fa-location-dot"></i>
                </div>
                <span>{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300">
                  <i className="fa-solid fa-phone"></i>
                </div>
                <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="hover:underline font-bold text-teal-300">
                  {CONTACT_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300">
                  <i className="fa-solid fa-envelope"></i>
                </div>
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:underline font-bold text-amber-300">
                  {CONTACT_INFO.email}
                </a>
              </div>
            </div>
          </div>
          {/* Subtle glowing orb */}
          <div className="absolute right-0 bottom-0 w-[200px] h-[200px] rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />
        </section>
      </div>
    </ShopLayout>
  );
}
