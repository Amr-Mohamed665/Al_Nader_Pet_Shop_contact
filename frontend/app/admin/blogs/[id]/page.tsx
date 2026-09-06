'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import ErrorState from '@/components/molecules/ErrorState';
import ImageUploader from '@/components/molecules/ImageUploader';
import { useBlogQuery, useUpdateBlogMutation } from '@/hooks/useBlogs';
import { blogSchema, type BlogFormData } from '@/lib/validators';
import { showToast } from '@/utils/toast';
import { cn } from '@/utils/cn';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditBlogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const { data: post, isLoading, error: fetchError } = useBlogQuery(id);
  const updateMutation = useUpdateBlogMutation();

  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isDraggingOverContent, setIsDraggingOverContent] = useState(false);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  const categoriesOptions = ['Care Guides', 'Cat Care', 'Dog Care', 'Nutrition', 'Reptiles', 'General'];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'Care Guides',
      author: 'Al Nader Pet Care Team',
      readTime: '5 min read',
      image: '',
      excerpt: '',
      content: '',
      tags: '',
    },
  });

  useEffect(() => {
    if (post) {
      const cat = post.category || 'Care Guides';
      setIsCustomCategory(!categoriesOptions.includes(cat));
      reset({
        title: post.title || '',
        slug: post.slug || '',
        category: cat,
        author: post.author || 'Al Nader Pet Care Team',
        readTime: post.readTime || '5 min read',
        image: post.image || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        tags: post.tags ? post.tags.join(', ') : '',
      });
    }
  }, [post, reset]);

  const contentValue = watch('content') || '';
  const categoryValue = watch('category') || '';

  const validationErrors = Object.values(errors)
    .map((e) => e?.message)
    .filter(Boolean) as string[];

  const formErrorList = submitError ? [submitError, ...validationErrors] : validationErrors;

  const uploadInlineFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setIsUploadingInline(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'lslwlv9d';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'pet-shop';
      
      const body = new FormData();
      body.append('file', file);
      body.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body,
      });

      if (!response.ok) throw new Error('Failed to upload image');
      const data = await response.json();

      if (data.secure_url) {
        const imageMarkdown = `\n![${file.name.replace(/\.[^/.]+$/, '')}](${data.secure_url})\n`;
        setValue('content', contentValue + imageMarkdown, { shouldValidate: true, shouldDirty: true });
      }
    } catch (err: any) {
      console.error('Failed to upload inline image:', err);
      setSubmitError('Failed to upload article inline image.');
    } finally {
      setIsUploadingInline(false);
    }
  };

  const handleContentDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOverContent(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
      for (const file of files) {
        await uploadInlineFile(file);
      }
    }
  };

  const onSubmit = async (data: BlogFormData) => {
    setSubmitError(null);
    const tagsArray = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : ['Pet Care'];

    try {
      const res = await updateMutation.mutateAsync({
        id,
        data: {
          title: data.title,
          slug: data.slug || undefined,
          category: data.category,
          author: data.author,
          readTime: data.readTime,
          image: data.image || '',
          excerpt: data.excerpt || '',
          content: data.content,
          tags: tagsArray,
        },
      });

      if (res.success) {
        showToast('success', 'Blog article updated successfully!');
        router.push('/admin/blogs');
      } else {
        setSubmitError(res.message || 'Failed to update article.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred while updating article.');
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
          {/* Hidden Inline File Input */}
          <input
            type="file"
            ref={inlineFileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadInlineFile(file);
            }}
            accept="image/*"
            className="hidden"
          />

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

          {/* Form Error Banner */}
          {formErrorList.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 shadow-xs">
              <i className="fa-solid fa-triangle-exclamation text-rose-500 text-base mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-rose-800 uppercase tracking-wider">
                  Please fix the following validation errors:
                </h4>
                <ul className="mt-1 space-y-1">
                  {formErrorList.map((msg, i) => (
                    <li key={i} className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      <span>•</span> {msg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Main Section (2 cols) */}
            <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Complete Syrian & Dwarf Hamster Care Guide"
                  {...register('title')}
                  className={cn(
                    'w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all',
                    errors.title
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 text-slate-800 focus:ring-purple-500'
                  )}
                />
                {errors.title && (
                  <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-exclamation text-rose-500" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Article Excerpt / Summary
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief 2-3 sentence summary displayed on card previews..."
                  {...register('excerpt')}
                  className={cn(
                    'w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 transition-all',
                    errors.excerpt
                      ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                      : 'border-slate-200 text-slate-700 focus:ring-purple-500'
                  )}
                />
                {errors.excerpt && (
                  <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-exclamation text-rose-500" />
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Full Article Content *
                </label>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingOverContent(true);
                  }}
                  onDragLeave={() => setIsDraggingOverContent(false)}
                  onDrop={handleContentDrop}
                  className="relative group rounded-2xl"
                >
                  <textarea
                    rows={14}
                    placeholder="Write your article text here. You can drag and drop images directly into this area to upload and embed them!"
                    {...register('content')}
                    className={cn(
                      'w-full px-4 py-3 bg-slate-50 border rounded-2xl text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 font-mono transition-all',
                      isDraggingOverContent
                        ? 'border-2 border-dashed border-purple-500 bg-purple-50/50'
                        : errors.content
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 text-slate-800 focus:ring-purple-500'
                    )}
                  />

                  {isDraggingOverContent && (
                    <div className="absolute inset-0 bg-purple-500/10 backdrop-blur-[2px] border-2 border-dashed border-purple-500 rounded-2xl flex items-center justify-center pointer-events-none">
                      <span className="bg-white/90 text-purple-700 px-4 py-2 rounded-full text-xs font-bold shadow-md">
                        <i className="fa-solid fa-file-image mr-2" />
                        Drop image to insert into article content
                      </span>
                    </div>
                  )}

                  {isUploadingInline && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-2xl flex items-center justify-center gap-2 pointer-events-none">
                      <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-purple-700">Uploading & inserting image...</span>
                    </div>
                  )}
                </div>
                {errors.content && (
                  <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                    <i className="fa-solid fa-circle-exclamation text-rose-500" />
                    {errors.content.message}
                  </p>
                )}
                <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <i className="fa-solid fa-circle-info text-slate-400" />
                  Tip: Drag &amp; drop image files onto the text area to upload directly.
                </p>
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Category</label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !isCustomCategory;
                        setIsCustomCategory(nextState);
                        setValue('category', nextState ? '' : categoriesOptions[0], { shouldValidate: true });
                      }}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 transition-colors"
                    >
                      {isCustomCategory ? 'Choose Preset' : '+ Type Custom'}
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <input
                      type="text"
                      placeholder="Type custom category name..."
                      {...register('category')}
                      className={cn(
                        'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 transition-all',
                        errors.category
                          ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                          : 'border-slate-200 text-slate-700 focus:ring-purple-500'
                      )}
                      autoFocus
                    />
                  ) : (
                    <select
                      value={categoryValue}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setValue('category', '', { shouldValidate: true });
                        } else {
                          setValue('category', e.target.value, { shouldValidate: true });
                        }
                      }}
                      className={cn(
                        'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-bold focus:outline-none focus:ring-2 transition-all',
                        errors.category
                          ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                          : 'border-slate-200 text-slate-700 focus:ring-purple-500'
                      )}
                    >
                      {categoriesOptions.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      <option value="__custom__">+ Type Custom Category...</option>
                    </select>
                  )}
                  {errors.category && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-rose-500" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name</label>
                  <input
                    type="text"
                    placeholder="Al Nader Pet Care Team"
                    {...register('author')}
                    className={cn(
                      'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all',
                      errors.author
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 focus:ring-purple-500'
                    )}
                  />
                  {errors.author && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-rose-500" />
                      {errors.author.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Read Time</label>
                  <input
                    type="text"
                    placeholder="5 min read"
                    {...register('readTime')}
                    className={cn(
                      'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all',
                      errors.readTime
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 focus:ring-purple-500'
                    )}
                  />
                  {errors.readTime && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-rose-500" />
                      {errors.readTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. hamster-care-guide"
                    {...register('slug')}
                    className={cn(
                      'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all',
                      errors.slug
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 focus:ring-purple-500'
                    )}
                  />
                  {errors.slug && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-rose-500" />
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="Hamster, Care, Pet Tips"
                    {...register('tags')}
                    className={cn(
                      'w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 transition-all',
                      errors.tags
                        ? 'border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500'
                        : 'border-slate-200 focus:ring-purple-500'
                    )}
                  />
                  {errors.tags && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center gap-1.5">
                      <i className="fa-solid fa-circle-exclamation text-rose-500" />
                      {errors.tags.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Cover Image Uploader with Cloud Toast error syncing */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <Controller
                  name="image"
                  control={control}
                  render={({ field }) => (
                    <ImageUploader
                      label="Article Cover Image"
                      value={field.value || ''}
                      onChange={(url) => field.onChange(url)}
                      formErrorMessages={formErrorList}
                      allowVideo={false}
                    />
                  )}
                />
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
                  disabled={updateMutation.isPending || isSubmitting}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {updateMutation.isPending || isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
