'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/organisms/Navbar';
import Footer from '@/components/organisms/Footer';
import Spinner from '@/components/atoms/Spinner';
import { useBlogsQuery } from '@/hooks/useBlogs';
import type { BlogPost } from '@/types';

export default function BlogIndexPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const { data: blogs = [], isLoading } = useBlogsQuery({
    search,
    category: selectedCategory === 'All' ? undefined : selectedCategory,
  });

  const categoriesList = ['All', 'Care Guides', 'Cat Care', 'Nutrition', 'Reptiles'];

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const regularPosts = blogs.length > 0 ? blogs.slice(1) : [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent opacity-60 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-200 border border-purple-400/30 backdrop-blur-md mb-4 animate-fade-in">
            <i className="fa-solid fa-sparkles text-amber-300" /> Al Nader Pet Journal
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Pet Care Guides & Expert Articles
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-purple-100/90 font-medium leading-relaxed mb-8">
            Discover veterinary advice, nutrition tips, training guides, and essential care instructions to keep your pets happy and healthy.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <i className="fa-solid fa-magnifying-glass absolute left-4 text-slate-400 text-sm" />
              <input
                type="text"
                placeholder="Search articles, care guides, pet types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/95 backdrop-blur-md text-slate-800 placeholder-slate-400 rounded-2xl shadow-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 border border-white/20 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <i className="fa-solid fa-xmark text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-105'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <span className="text-xs font-bold text-slate-400">Loading pet guides & articles...</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
              <i className="fa-solid fa-newspaper" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No articles found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any articles matching your search query or category filter. Try clearing your filters.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-500 transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post Banner */}
            {!search && selectedCategory === 'All' && featuredPost && (
              <div className="relative bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl hover:shadow-2xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
                <div className="lg:col-span-7 relative min-h-[280px] sm:min-h-[360px] overflow-hidden bg-slate-100">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-purple-600/90 backdrop-blur-md text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-md">
                      Featured Guide
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 mb-3">
                      <span className="text-purple-600 font-bold">{featuredPost.category}</span>
                      <span>•</span>
                      <span>{featuredPost.readTime}</span>
                      <span>•</span>
                      <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                    </div>

                    <Link href={`/blog/${featuredPost.slug}`}>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 hover:text-purple-600 transition-colors mb-3 leading-snug">
                        {featuredPost.title}
                      </h2>
                    </Link>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-6">
                      {featuredPost.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                        <i className="fa-solid fa-user-pen" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">{featuredPost.author}</span>
                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md group/btn"
                    >
                      Read Article
                      <i className="fa-solid fa-arrow-right text-[10px] group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center justify-between">
                <span>{search || selectedCategory !== 'All' ? 'Articles Results' : 'Recent Articles'}</span>
                <span className="text-xs font-semibold text-slate-400">{blogs.length} articles</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(!search && selectedCategory === 'All' ? regularPosts : blogs).map((post: BlogPost) => (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-purple-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md shadow-xs">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2">
                          <span>{post.readTime}</span>
                          <span>•</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <h3 className="text-base font-extrabold text-slate-800 hover:text-purple-600 transition-colors mb-2 line-clamp-2 leading-snug">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">
                          {post.author}
                        </span>

                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs font-extrabold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 group/link"
                        >
                          Read
                          <i className="fa-solid fa-arrow-right text-[9px] group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
