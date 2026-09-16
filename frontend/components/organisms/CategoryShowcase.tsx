'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCategoriesQuery } from '@/hooks/useCategories';
import Spinner from '@/components/atoms/Spinner';
import type { Category } from '@/types';

interface CardTheme {
  bgColor: string;
  borderColor: string;
  hoverBg: string;
  accentColor: string;
}

const CARD_THEMES: CardTheme[] = [
  {
    bgColor: 'bg-[#FFF5EC]',
    borderColor: 'border-[#FFE4CC]',
    hoverBg: 'hover:bg-[#FFEBD6]',
    accentColor: 'text-[#E8961C]',
  },
  {
    bgColor: 'bg-[#F0F5FF]',
    borderColor: 'border-[#D9E6FF]',
    hoverBg: 'hover:bg-[#E1EDFF]',
    accentColor: 'text-[#3B82F6]',
  },
  {
    bgColor: 'bg-[#F9F5FF]',
    borderColor: 'border-[#E9D5FF]',
    hoverBg: 'hover:bg-[#F3E8FF]',
    accentColor: 'text-[#7C4DDB]',
  },
  {
    bgColor: 'bg-[#EBFDFB]',
    borderColor: 'border-[#C8F7F3]',
    hoverBg: 'hover:bg-[#D5FAF6]',
    accentColor: 'text-[#179E91]',
  },
  {
    bgColor: 'bg-[#FFF0F0]',
    borderColor: 'border-[#FECDCD]',
    hoverBg: 'hover:bg-[#FFE0E0]',
    accentColor: 'text-[#E53E3E]',
  },
  {
    bgColor: 'bg-[#F0FFF4]',
    borderColor: 'border-[#C6F6D5]',
    hoverBg: 'hover:bg-[#D4FADF]',
    accentColor: 'text-[#276749]',
  },
];

export default function CategoryShowcase() {
  const { data: categories = [], isLoading, error } = useCategoriesQuery();

  const animalCategories = categories.filter(
    (c) =>
      !c.isAccessory &&
      (c.parentId === null || c.parentId === undefined) &&
      c.slug !== 'accessories' &&
      !c.slug.toLowerCase().includes('accessories') &&
      !c.name.toLowerCase().includes('accessories')
  );

  const showcaseCategories: Category[] = [
    ...animalCategories,
    {
      id: 'accessories-showcase',
      name: 'Accessories',
      slug: 'accessories',
      description: 'Beds, collars, toys, food bowls, carriers, and grooming accessories.',
      image: '/images/accessories-category.jpg',
    },
  ];

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center gap-3">
        <Spinner size="md" />
        <span className="text-xs text-slate-400 font-bold tracking-wide">Loading categories...</span>
      </div>
    );
  }

  if (error || categories.length === 0) {
    return null;
  }

  return (
    <section className="mb-14">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
        {showcaseCategories.map((cat, idx) => {
          const theme = CARD_THEMES[idx % CARD_THEMES.length];
          const href = cat.slug === 'accessories' ? '/accessories' : `/category/${cat.slug}`;

          return (
            <Link
              key={cat.id || cat.slug}
              href={href}
              className={`flex items-center gap-4 p-4 rounded-2xl border ${theme.bgColor} ${theme.borderColor} ${theme.hoverBg} transition-all duration-300 shadow-sm hover:shadow-md group relative`}
            >
              {/* Image (left) */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-inner">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="80px"
                    unoptimized
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 font-bold">🐾</div>
                )}
              </div>

              {/* Content (right) */}
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug font-medium mt-0.5 mb-1.5 truncate">
                  {cat.description || `Shop premium ${cat.name.toLowerCase()} supplies`}
                </p>
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${theme.accentColor} uppercase tracking-wider group-hover:translate-x-0.5 transition-transform`}>
                  Shop {cat.name} <span className="text-[10px]">→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
