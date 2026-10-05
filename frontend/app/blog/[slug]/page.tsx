'use client';

import { use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/organisms/Navbar';
import Footer from '@/components/organisms/Footer';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import { useBlogQuery, useBlogsQuery } from '@/hooks/useBlogs';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function SingleBlogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { data: post, isLoading, error } = useBlogQuery(slug);
  const { data: allBlogs = [] } = useBlogsQuery();

  const relatedPosts = allBlogs
    .filter((b) => b.slug !== slug && b.id !== post?.id)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" />
          <span className="text-xs font-bold text-slate-400">Loading article...</span>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-20">
          <ErrorState
            title="Article Not Found"
            message="The requested blog post could not be found or may have been removed."
            onRetry={() => window.location.reload()}
          />
          <div className="text-center mt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-500 transition-all shadow-md"
            >
              <i className="fa-solid fa-arrow-left text-xs" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs"
          >
            <i className="fa-solid fa-arrow-left text-[10px]" />
            Back to Articles
          </Link>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64 sm:h-96 w-full bg-slate-100 overflow-hidden">
            {post.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 flex items-center justify-center">
                <i className="fa-solid fa-newspaper text-4xl text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <span className="px-3 py-1 bg-purple-600 text-white text-[11px] font-extrabold uppercase tracking-wider rounded-lg shadow-sm inline-block mb-3">
                {post.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-2">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-200">
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-user text-purple-300" />
                  {post.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-clock text-purple-300" />
                  {post.readTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <i className="fa-solid fa-calendar text-purple-300" />
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-10 space-y-6">
            {/* Excerpt callout box */}
            {post.excerpt && (
              <div className="p-4 sm:p-5 bg-purple-50/80 border-l-4 border-purple-600 rounded-r-2xl text-slate-700 font-semibold text-sm sm:text-base leading-relaxed">
                {post.excerpt}
              </div>
            )}

            {/* Article content text */}
            <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
              {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-400 mr-2">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Author Box */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0">
                <i className="fa-solid fa-user-doctor" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-800">{post.author}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  Pet Care & Health Specialist at Al Nader Pet Shop. Dedicated to happy, healthy pets.
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 pt-6">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">Related Articles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 p-4 hover:shadow-lg transition-all group flex flex-col justify-between"
                >
                  <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-3">
                    <img src={rel.image} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-wider block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-xs font-extrabold text-slate-800 group-hover:text-purple-600 transition-colors line-clamp-2 mb-2 leading-snug">
                      {rel.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {rel.readTime}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
