'use client';

import ShopLayout from '@/components/templates/ShopLayout';
import ContactSection from '@/components/organisms/ContactSection';

export default function ContactPage() {
  return (
    <ShopLayout>
      <div className="max-w-5xl mx-auto py-6 sm:py-10 animate-fade-in">
        <ContactSection />
      </div>
    </ShopLayout>
  );
}
