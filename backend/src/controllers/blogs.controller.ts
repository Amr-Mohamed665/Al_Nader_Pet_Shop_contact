import type { Request, Response, NextFunction } from 'express';
import * as blogsStore from '../data/blogsStore';
import ApiError from '../utils/ApiError';

/** GET /api/blogs */
export function getBlogs(req: Request, res: Response): void {
  const { search, category } = req.query;
  const blogs = blogsStore.getAll({
    search: search ? String(search) : undefined,
    category: category ? String(category) : undefined,
  });
  res.status(200).json({ success: true, count: blogs.length, data: blogs });
}

/** GET /api/blogs/:slugOrId */
export function getBlog(req: Request, res: Response, next: NextFunction): void {
  const blog = blogsStore.getBySlugOrId(req.params['slugOrId']!);
  if (!blog) {
    next(new ApiError(404, `Blog post '${req.params['slugOrId']}' was not found.`));
    return;
  }
  res.status(200).json({ success: true, data: blog });
}

/** POST /api/blogs (admin) */
export function createBlog(req: Request, res: Response, next: NextFunction): void {
  const { title, excerpt, content, category, image, author, readTime, tags, slug } = req.body;

  if (!title || !content) {
    next(new ApiError(400, 'Title and Content are required fields.'));
    return;
  }

  const newPost = blogsStore.create({
    title,
    excerpt: excerpt || '',
    content,
    category: category || 'General',
    image: image || '/images/accessories-category.jpg',
    author: author || 'Al Nader Pet Care Team',
    readTime: readTime || '5 min read',
    tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : ['Pet Care'],
    slug,
  });

  res.status(201).json({ success: true, data: newPost });
}

/** PUT /api/blogs/:id (admin) */
export function updateBlog(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  const updated = blogsStore.update(id!, req.body);

  if (!updated) {
    next(new ApiError(404, `Blog post with id '${id}' was not found.`));
    return;
  }

  res.status(200).json({ success: true, data: updated });
}

/** DELETE /api/blogs/:id (admin) */
export function deleteBlog(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  const success = blogsStore.remove(id!);

  if (!success) {
    next(new ApiError(404, `Blog post with id '${id}' was not found.`));
    return;
  }

  res.status(200).json({ success: true, message: 'Blog post deleted successfully.' });
}
