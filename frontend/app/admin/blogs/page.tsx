'use client';

import { useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import ConfirmModal from '@/components/molecules/ConfirmModal';
import Button from '@/components/atoms/Button';
import { useBlogsQuery, useDeleteBlogMutation } from '@/hooks/useBlogs';
import { showToast } from '@/utils/toast';
import type { BlogPost } from '@/types';

export default function AdminBlogsPage() {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);

  const { data: blogs = [], isLoading, error, refetch } = useBlogsQuery({
    search,
  });

  const deleteMutation = useDeleteBlogMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      showToast('success', 'Blog article deleted successfully!');
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete blog article.');
      setDeleteTarget(null);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Blogs
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Create, edit, and publish articles & care guides for Al Nader Pet Shop.
              </p>
            </div>

            <Link href="/admin/blogs/new" className="w-full sm:w-auto">
              <Button
                variant="primary"
                className="w-full sm:w-auto justify-center font-extrabold text-xs shadow-md shadow-teal-500/10 flex items-center gap-2 py-2.5"
              >
                <i className="fa-solid fa-plus text-[12px]" /> Create Article
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-newspaper" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Articles</span>
                <span className="text-2xl font-extrabold text-slate-900">{blogs.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-book-open" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Care Guides</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {blogs.filter((b) => b.category?.includes('Guide') || b.category === 'Care Guides').length}
                </span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                <i className="fa-solid fa-layer-group" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Categories</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  {new Set(blogs.map((b) => b.category)).size}
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
            <div className="relative flex-grow w-full">
              <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles by title, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Table / List View */}
          {isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading articles...</span>
            </div>
          ) : error ? (
            <ErrorState
              title="Error loading articles"
              message="Failed to connect to the backend server."
              onRetry={refetch}
            />
          ) : blogs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
              <span className="text-3xl">📰</span>
              <h3 className="text-sm font-extrabold text-slate-800">No blog posts found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search
                  ? 'No articles match your search filter.'
                  : 'Click "Create Article" above to publish your first blog article.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Read Time</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {blogs.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-center gap-3">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0 bg-slate-50 shadow-xs"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-extrabold text-slate-900 truncate" title={post.title}>
                                {post.title}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-extrabold capitalize">
                            {post.category}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {post.author}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-medium">
                          {post.readTime}
                        </td>

                        <td className="py-3 px-4 text-slate-400 text-xs font-medium">
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="Preview Article Page"
                              aria-label="Preview"
                            >
                              <i className="fa-solid fa-eye text-[15px]" />
                            </Link>

                            <Link
                              href={`/admin/blogs/${post.id}`}
                              className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all inline-block"
                              title="Edit Article Page"
                              aria-label="Edit"
                            >
                              <i className="fa-solid fa-pen text-[15px]" />
                            </Link>

                            <button
                              onClick={() => setDeleteTarget(post)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                              title="Delete Article"
                              aria-label="Delete"
                            >
                              <i className="fa-solid fa-trash text-[15px]" />
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

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete Blog Article?"
          description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          isDanger
          isLoading={deleteMutation.isPending}
        />
      </AdminLayout>
    </AdminRoute>
  );
}
