'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import Link from 'next/link';
import { CONTACT_INFO } from '@/constants/navigation';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 18, 2026';

  return (
    <ShopLayout>
      <div className="space-y-10 sm:space-y-12 animate-fade-in max-w-4xl mx-auto pb-12">
        {/* Header Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-[#2A1558] text-white p-8 sm:p-12 text-center">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/25 border border-purple-400/35 rounded-full text-xs font-bold text-purple-200 tracking-wider">
              <i className="fa-solid fa-shield-halved text-[11px]"></i> LEGAL &amp; COMPLIANCE
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Privacy <span className="text-[#F5A623]">Policy</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 font-medium">
              Last updated: {lastUpdated}
            </p>
          </div>
          <div className="absolute top-[-80px] left-[-80px] w-[240px] h-[240px] rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-80px] right-[-80px] w-[240px] h-[240px] rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        </section>

        {/* Policy Content */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-slate-700 text-sm leading-relaxed">
          
          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">1</span>
              Introduction
            </h2>
            <p>
              Welcome to <strong>Al Nader Pets &amp; Accessories Trading L.L.C</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We respect your privacy and are committed to safeguarding the personal information of our customers and website visitors across the United Arab Emirates and internationally.
            </p>
            <p>
              This Privacy Policy explains what personal data we collect when you visit our website or purchase our pet supplies, how we use and store that information, and your rights under applicable UAE privacy and consumer protection laws.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">2</span>
              Information We Collect
            </h2>
            <p>We may collect information directly from you when you interact with our store, including:</p>
            <ul className="list-disc pl-5 space-y-1.5 marker:text-purple-500 font-medium">
              <li><strong>Contact Information:</strong> Full name, email address, phone number, and physical delivery address in the UAE.</li>
              <li><strong>Account Credentials:</strong> Username, encrypted password, and order history.</li>
              <li><strong>Payment Information:</strong> Payment status (unpaid/paid upon arrival). <em>(Note: Because we operate exclusively on Cash on Delivery, we never collect, handle, or store credit card details or digital payment account info).</em></li>
              <li><strong>Device &amp; Usage Data:</strong> IP address, browser type, operating system, and website browsing patterns.</li>
            </ul>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">3</span>
              How We Use Your Information
            </h2>
            <p>We use the data collected for legitimate commercial and operational purposes, such as:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/80">
                <h4 className="font-bold text-xs text-purple-900 mb-1">📦 Order Fulfillment</h4>
                <p className="text-xs text-slate-600">Processing orders, packaging pet supplies, and orchestrating doorstep delivery.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100/80">
                <h4 className="font-bold text-xs text-teal-900 mb-1">💬 Customer Service</h4>
                <p className="text-xs text-slate-600">Responding to inquiries, tracking shipments, and providing expert advice on pet items.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100/80">
                <h4 className="font-bold text-xs text-amber-900 mb-1">🔒 Security &amp; Fraud Prevention</h4>
                <p className="text-xs text-slate-600">Protecting user accounts and verifying transaction authenticity.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                <h4 className="font-bold text-xs text-blue-900 mb-1">✨ Experience Improvement</h4>
                <p className="text-xs text-slate-600">Optimizing website performance, catalog navigation, and personalized recommendations.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">4</span>
              Data Protection &amp; Security
            </h2>
            <p>
              We implement industry-standard encryption protocols (HTTPS/SSL), firewalls, and strict internal access controls to secure your personal records against unauthorized access, loss, or alteration.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">5</span>
              Third-Party Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal data to third parties. We only share necessary information with trusted third-party service providers (such as logistics courier partners and authorized payment gateways) to fulfill your orders.
            </p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">6</span>
              Your Rights &amp; Choices
            </h2>
            <p>You have the right to access, update, or request the deletion of your account and personal data at any time. To exercise these rights, please contact our support team.</p>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-3">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-black">7</span>
              Contact Us Regarding Privacy
            </h2>
            <p>If you have any questions or concerns regarding our privacy practices, please contact us:</p>
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
