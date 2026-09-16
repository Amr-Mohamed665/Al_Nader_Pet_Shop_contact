'use client';

import Image from 'next/image';

interface CustomerPhoto {
  id: number;
  image: string;
  alt: string;
}

const CUSTOMER_PHOTOS: CustomerPhoto[] = [
  {
    id: 1,
    image: '/images/customers/customer-1.jpg',
    alt: 'Satisfied blonde customer holding fluffy white Pomeranian',
  },
  {
    id: 2,
    image: '/images/customers/customer-2.jpg',
    alt: 'Satisfied customer in black mask holding brown puppy',
  },
  {
    id: 3,
    image: '/images/customers/customer-3.jpg',
    alt: 'Satisfied customer in yellow dress and black mask holding white Pomeranian',
  },
  {
    id: 4,
    image: '/images/customers/customer-4.jpg',
    alt: 'Satisfied couple in blue surgical masks holding brown puppy',
  },
  {
    id: 5,
    image: '/images/customers/customer-5.jpg',
    alt: 'Satisfied woman in grey sweater holding fluffy Pomeranian puppy',
  },
  {
    id: 6,
    image: '/images/customers/customer-6.jpg',
    alt: 'Satisfied couple holding fluffy white and brown Shih Tzu puppy',
  },
  {
    id: 7,
    image: '/images/customers/customer-7.jpg',
    alt: 'Happy family holding a toddler and a small Pug puppy',
  },
  {
    id: 8,
    image: '/images/customers/customer-8.jpg',
    alt: 'Satisfied man holding two fluffy grey and white Pomeranian puppies',
  },
  {
    id: 9,
    image: '/images/customers/customer-9.jpg',
    alt: 'Boy giving a thumbs up and woman holding a small brown poodle puppy',
  },
  {
    id: 10,
    image: '/images/customers/customer-10.jpg',
    alt: 'Satisfied woman in checkered blazer holding a small white Pomeranian puppy',
  },
  {
    id: 11,
    image: '/images/customers/customer-11.jpg',
    alt: 'Group of happy friends wearing face masks and holding small dogs',
  },
  {
    id: 12,
    image: '/images/customers/customer-12.jpg',
    alt: 'Satisfied man in black face mask holding a white Bull Terrier puppy',
  },
];

export default function CustomerCarousel() {
  return (
    <section className="mb-14 relative overflow-hidden py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-1">
            <i className="fa-solid fa-paw text-[10px]"></i> SATISFIED CUSTOMERS
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Happy Pets, Happy <span className="text-purple-600">Families</span>
          </h2>
        </div>
      </div>

      {/* Continuous Marquee Container */}
      <div className="relative w-full overflow-hidden">
        {/* Soft edge fade overlays for a premium gradient effect */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FFF9F0] via-[#FFF9F0]/50 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#FFF9F0] via-[#FFF9F0]/50 to-transparent z-20 pointer-events-none" />

        {/* Scrolling track: doubled items for endless seamless loop */}
        <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused] py-2">
          {/* First loop of images */}
          {CUSTOMER_PHOTOS.map((photo) => (
            <div
              key={`loop1-${photo.id}`}
              className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] group"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm group-hover:shadow-md transition-all duration-300">
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-500"
                  sizes="(max-width: 640px) 180px, 220px"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
              </div>
            </div>
          ))}

          {/* Second loop of images (identical clone for loop continuity) */}
          {CUSTOMER_PHOTOS.map((photo) => (
            <div
              key={`loop2-${photo.id}`}
              className="flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] group"
              aria-hidden="true"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm group-hover:shadow-md transition-all duration-300">
                <Image
                  src={photo.image}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-103 transition-transform duration-500"
                  sizes="(max-width: 640px) 180px, 220px"
                  unoptimized
                />
                <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/15 to-transparent" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
