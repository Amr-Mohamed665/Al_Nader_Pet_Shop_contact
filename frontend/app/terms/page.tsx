'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import Link from 'next/link';
import { CONTACT_INFO } from '@/constants/navigation';

export default function TermsAndConditionsPage() {
  const lastUpdated = 'August 18, 2026';

  return (
    <ShopLayout>
      <div className="space-y-10 sm:space-y-12 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#2A1558] text-white p-8 sm:p-12 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/25 border border-purple-400/35 rounded-full text-xs font-bold text-purple-200 tracking-wider">
              <i className="fa-solid fa-file-contract text-[11px]"></i> TERMS OF SERVICE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Terms &amp; <span className="text-[#F5A623]">Conditions</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 font-medium">
              Last updated: {lastUpdated}
            </p>
          </div>
          <div className="absolute top-[-80px] left-[-80px] w-[240px] h-[240px] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        </section>

        {/* Terms Content */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">1</span>
              Agreement to Terms
            </h2>
            <p>
              By accessing or using the website of <strong>Al Nader Pets &amp; Accessories Trading L.L.C</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), or by purchasing products from us, you agree to be bound by these Terms &amp; Conditions and all applicable laws of the United Arab Emirates.
            </p>
            <p>
              If you do not agree with any part of these terms, you should discontinue using our website and services immediately.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">2</span>
              Products &amp; Pricing
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-purple-500 font-medium">
              <li>All prices listed on our platform are denominated in <strong>United Arab Emirates Dirham (AED)</strong> unless specified otherwise.</li>
              <li>We strive to ensure accurate descriptions, images, and prices for all pet food, cages, beds, toys, and accessories. However, typographical errors may occasionally occur. We reserve the right to correct errors and update product information at any time.</li>
              <li>Product availability is subject to stock levels. In the rare event that an item is out of stock after an order is placed, our support team will contact you promptly to arrange an alternative or issue a full refund.</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">3</span>
              Orders &amp; Payment Terms
            </h2>
            <p>
              Orders placed through our website represent an offer to purchase. We operate exclusively on a <strong>Cash on Delivery (COD)</strong> basis. No online credit card, debit card, or electronic payment details are collected or processed.
            </p>
            <p>
              By placing an order, you agree to pay the total order amount in cash at the time of delivery to your doorstep.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">4</span>
              Shipping &amp; Delivery in the UAE
            </h2>
            <div className="space-y-2">
              <p>We provide fast and reliable doorstep delivery across Dubai, Abu Dhabi, Sharjah, and all Emirates in the UAE.</p>
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-100 text-teal-900 text-xs font-medium space-y-1">
                <p><strong>🚚 Standard Delivery:</strong> Typically dispatched within 24 to 48 hours.</p>
                <p><strong>📍 Accurate Address:</strong> Customers are responsible for providing complete and accurate delivery addresses and contact numbers to ensure successful delivery.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">5</span>
              Returns &amp; Exchanges Policy
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-purple-500 font-medium">
              <li>Unopened, unused pet accessories in their original packaging may be returned or exchanged within <strong>7 days</strong> of delivery.</li>
              <li>For pet hygiene and health safety reasons, opened pet food packages, treats, and used grooming tools cannot be returned once opened unless defective upon arrival.</li>
              <li>To initiate a return or report a damaged delivery, contact our customer service team with your Order ID and photo evidence.</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">6</span>
              Pet Health &amp; Product Suitability
            </h2>
            <p>
              Pet owners are responsible for selecting food, vitamins, and equipment appropriate for their pet&apos;s specific breed, age, size, and dietary restrictions. If in doubt regarding medical or dietary requirements, please consult a certified veterinarian.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">7</span>
              Governing Law &amp; Jurisdiction
            </h2>
            <p>
              These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Emirate of Dubai and the federal laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the Dubai Courts.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">8</span>
              Contact Information
            </h2>
            <p>For questions or notices regarding these Terms, please contact us at:</p>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2 font-medium">
              <p><strong>Al Nader Pets &amp; Accessories Trading L.L.C</strong></p>
              <p>📍 {CONTACT_INFO.address}</p>
              <p>📞 Phone: <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="text-purple-600 font-bold hover:underline">{CONTACT_INFO.phone}</a></p>
              <p>✉️ Email: <a href={`mailto:${CONTACT_INFO.email}`} className="text-purple-600 font-bold hover:underline">{CONTACT_INFO.email}</a></p>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-purple-600 hover:text-purple-700 bg-white border border-purple-200 px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i>
            Return to Homepage
          </Link>
        </div>
      </div>
    </ShopLayout>
  );
}
