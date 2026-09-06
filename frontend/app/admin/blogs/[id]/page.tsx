'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import { useBlogQuery, useUpdateBlogMutation } from '@/hooks/useBlogs';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { data: post, isLoading, error: fetchError } = useBlogQuery(id);
  const updateMutation = useUpdateBlogMutation();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Care Guides',
    author: 'Al Nader Pet Care Team',
    readTime: '5 min read',
    image: '',
    excerpt: '',
    content: '',
    tags: '',
  });

  const [error, setError] = useState<string | null>(null);

  const categoriesOptions = ['Care Guides', 'Cat Care', 'Dog Care', 'Nutrition', 'Reptiles', 'General'];

  const [prevPost, setPrevPost] = useState<any>(null);

  if (post && post !== prevPost) {
    setPrevPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      category: post.category || 'Care Guides',
      author: post.author || 'Al Nader Pet Care Team',
      readTime: post.readTime || '5 min read',
      image: post.image || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      tags: post.tags ? post.tags.join(', ') : '',
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and Content are required fields.');
      return;
    }

    setError(null);
    const tagsArray = formData.tags
      ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Pet Care'];

    try {
      const res = await updateMutation.mutateAsync({
        id,
        data: {
          title: formData.title,
          slug: formData.slug || undefined,
          category: formData.category,
          author: formData.author,
          readTime: formData.readTime,
          image: formData.image,
          excerpt: formData.excerpt,
          content: formData.content,
          tags: tagsArray,
        },
      });

      if (res.success) {
        router.push('/admin/blogs');
      } else {
        setError(res.message || 'Failed to update article.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating article.');
    }
  };

  if (isLoading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" />
            <span className="text-xs font-bold text-slate-400">Loading article details...</span>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  if (fetchError || !post) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="max-w-xl mx-auto py-12">
            <ErrorState
              title="Article Not Found"
              message="The blog article you are trying to edit could not be found."
              onRetry={() => window.location.reload()}
            />
            <div className="text-center mt-4">
              <Link href="/admin/blogs" className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl">
                Back to Blog Management
              </Link>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
          {/* Top Bar Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
                <Link href="/admin/blogs" className="hover:text-purple-600 transition-colors">
                  Blog Management
                </Link>
                <span>/</span>
                <span className="text-slate-700 font-bold">Edit Article</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-pen-to-square text-purple-600" />
                Edit Article
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-xl hover:bg-purple-100 transition-all border border-purple-200/60"
              >
                <i className="fa-solid fa-eye text-xs" />
                Preview
              </Link>

              <Link
                href="/admin/blogs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                <i className="fa-solid fa-arrow-left text-xs" />
                Back to Articles
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Main Section (2 cols) */}
            <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Complete Syrian & Dwarf Hamster Care Guide"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Article Excerpt / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief 2-3 sentence summary displayed on card previews..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Full Article Content *
                </label>
                <textarea
                  rows={14}
                  required
                  placeholder="Write your article text here. Supports headings, bullet points, and paragraphs..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
            </div>

            {/* Right Sidebar Section (1 col) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <i className="fa-solid fa-sliders text-purple-600 text-xs" />
                  Article Settings
                </h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categoriesOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="Al Nader Pet Care Team"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    placeholder="5 min read"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. hamster-care-guide"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Hamster, Care, Pet Tips"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Image Preview Box */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                  <i className="fa-solid fa-image text-purple-600 text-xs" />
                  Cover Image
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Image URL</label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="relative h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  {formData.image ? (
                    <img
                      src={formData.image}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/accessories-category.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                      <i className="fa-solid fa-image text-2xl mb-1" />
                      No Image Provided
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-3">
                <Link
                  href="/admin/blogs"
                  className="flex-1 py-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition-all"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
