'use client';

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import ShopLayout from '@/components/templates/ShopLayout';
import Button from '@/components/atoms/Button';

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <ShopLayout>
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 max-w-2xl mx-auto animate-fade-in">
        {/* Animated Dog Icon */}
        <div className="relative mb-6">
          <div className="text-8xl animate-bounce duration-1000 select-none">
            🐶
          </div>
          {/* Lost Question Mark Icon */}
          <div className="absolute -top-3 -right-3 bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-extrabold shadow-md animate-pulse">
            ?
          </div>
        </div>

        {/* 404 Header */}
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-teal-500 tracking-tight leading-none mb-4">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Oops! This Page Has Run Away
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 max-w-md">
          We couldn&apos;t find the page you were looking for. It might have wandered off, or the link is broken. Let&apos;s get you back on track!
        </p>

        {/* Dynamic Search Box */}
        <form onSubmit={handleSearchSubmit} className="w-full max-w-md mb-8">
          <label htmlFor="search-input" className="sr-only">Search products</label>
          <div className="relative flex items-center">
            <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-[14px]"></i>
            <input
              id="search-input"
              type="text"
              placeholder="Search pets or accessories..."
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-24 py-3 text-sm font-semibold bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-1.5 text-xs font-extrabold bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-95"
            >
              Search
            </button>
          </div>
        </form>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            href="/"
            variant="primary"
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs uppercase font-extrabold tracking-wider rounded-2xl shadow-lg shadow-purple-500/10 cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-house"></i> Back to Home
          </Button>
          <Button
            href="/products"
            variant="outline"
            className="w-full sm:w-auto px-6 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs uppercase font-extrabold tracking-wider rounded-2xl cursor-pointer flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-bag-shopping"></i> Browse Products
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
