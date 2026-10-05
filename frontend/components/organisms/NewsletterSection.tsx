'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section className="mb-14">
      <div className="relative overflow-hidden rounded-3xl bg-[#581C87] text-white py-10 px-6 sm:px-10 lg:px-16 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left - Puppy and Kitten Image */}
          <div className="col-span-1 md:col-span-4 hidden md:block relative aspect-[4/3] w-full rounded-2xl overflow-hidden shadow-inner">
            <Image
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=400&auto=format&fit=crop"
              alt="Adorable puppy and kitten side by side"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 30vw"
              unoptimized
            />
          </div>

          {/* Right - Subscription form */}
          <div className="col-span-1 md:col-span-8 space-y-4 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Join Our Pet Lovers Community!
            </h2>
            <p className="text-sm text-purple-100/90 leading-relaxed font-medium">
              Subscribe for tips, offers & updates on new arrivals.
            </p>

            {submitted ? (
              <div className="inline-flex items-center gap-2 px-5 py-3 bg-white/20 text-white rounded-xl backdrop-blur-sm animate-scale-in">
                <i className="fa-solid fa-circle-check text-[16px]"></i>
                <span className="font-bold text-xs sm:text-sm">Thank you for subscribing!</span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-lg mt-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-grow px-4 py-3 rounded-xl bg-white/10 text-white placeholder-purple-200 border border-white/20 focus:border-white/50 focus:outline-none focus:ring-1 focus:ring-white/20 text-xs sm:text-sm transition-all"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-purple-50 text-[#581C87] font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-md hover:-translate-y-0.5"
                >
                  <span>Subscribe</span>
                  <i className="fa-solid fa-paper-plane text-[13px]"></i>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
