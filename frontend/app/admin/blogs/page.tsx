'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import { useBlogsQuery, useDeleteBlogMutation } from '@/hooks/useBlogs';
import type { BlogPost } from '@/types';

export default function AdminBlogsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const { data: blogs = [], isLoading, error, refetch } = useBlogsQuery({
    search,
    category: categoryFilter === 'All' ? undefined : categoryFilter,
  });

  const deleteMutation = useDeleteBlogMutation();

  const handleDelete = async (post: BlogPost) => {
    if (confirm(`Are you sure you want to delete the blog post "${post.title}"?`)) {
      try {
        await deleteMutation.mutateAsync(post.id);
        refetch();
      } catch (err: any) {
        alert(err.message || 'Failed to delete blog post.');
      }
    }
  };

  const categoriesOptions = ['Care Guides', 'Cat Care', 'Dog Care', 'Nutrition', 'Reptiles', 'General'];

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                <i className="fa-solid fa-newspaper text-purple-600" />
                Blog Management
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Create, edit, and publish articles & care guides for Al Nader Pet Shop.
              </p>
            </div>

            <Link
              href="/admin/blogs/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <i className="fa-solid fa-plus text-xs" />
              Create Article
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-newspaper" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Articles</span>
                <span className="text-2xl font-extrabold text-slate-800">{blogs.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-book-open" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Care Guides</span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {blogs.filter((b) => b.category.includes('Guide') || b.category === 'Care Guides').length}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-layer-group" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Categories</span>
                <span className="text-2xl font-extrabold text-slate-800">
                  {new Set(blogs.map((b) => b.category)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search articles by title, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize"
              >
                <option value="All">All Categories</option>
                {categoriesOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table / List View */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" />
              <span className="text-xs font-bold text-slate-400">Loading articles...</span>
            </div>
          ) : error ? (
            <ErrorState
              title="Error loading articles"
              message="Failed to connect to the backend server."
              onRetry={refetch}
            />
          ) : blogs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-xs">
              <i className="fa-solid fa-newspaper text-4xl text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No blog posts found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Click "+ Create Article" above to publish your first blog article page.
              </p>
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                <i className="fa-solid fa-plus text-xs" />
                Create Article Page
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Read Time</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {blogs.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0 bg-slate-100"
                            />
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-800 truncate" title={post.title}>
                                {post.title}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                /{post.slug}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md font-bold text-[10px] uppercase tracking-wide border border-purple-100">
                            {post.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-600">
                          {post.author}
                        </td>

                        <td className="py-3 px-4 text-slate-500">
                          {post.readTime}
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Preview Article Page"
                            >
                              <i className="fa-solid fa-eye text-xs" />
                            </Link>

                            <Link
                              href={`/admin/blogs/${post.id}`}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors inline-block"
                              title="Edit Article Page"
                            >
                              <i className="fa-solid fa-pen-to-square text-xs" />
                            </Link>

                            <button
                              onClick={() => handleDelete(post)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Article"
                            >
                              <i className="fa-solid fa-trash text-xs" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
