import type { Request, Response, NextFunction } from 'express';
import * as categoriesStore from '../data/categoriesStore';
import * as menuItemsStore from '../data/menuItemsStore';
import ApiError from '../utils/ApiError';

function isAccessoriesDescendant(parentId: string): boolean {
  if (!parentId) return false;
  if (parentId === '4') return true;
  const parent = categoriesStore.getById(parentId);
  if (!parent) return false;
  if (parent.slug === 'accessories') return true;
  const ancestors = categoriesStore.getAncestors(parentId);
  return ancestors.some((a) => a.id === '4' || a.slug === 'accessories');
}

/** GET /api/categories  (public) */
export function getCategories(req: Request, res: Response): void {
  const categories = categoriesStore.getAll();
  res.status(200).json({ success: true, count: categories.length, data: categories });
}

/** GET /api/categories/:id  (public) */
export function getCategory(req: Request, res: Response, next: NextFunction): void {
  let category = categoriesStore.getById(req.params['id']!);
  if (!category) {
    category = categoriesStore.getBySlug(req.params['id']!);
  }
  if (!category) {
    next(new ApiError(404, `Category with id or slug '${req.params['id']}' was not found.`));
    return;
  }
  res.status(200).json({ success: true, data: category });
}

/** GET /api/categories/:id/children  (public) */
export function getCategoryChildren(req: Request, res: Response, next: NextFunction): void {
  const category = categoriesStore.getById(req.params['id']!);
  if (!category) {
    next(new ApiError(404, `Category with id '${req.params['id']}' was not found.`));
    return;
  }
  const children = categoriesStore.getChildren(req.params['id']!);
  res.status(200).json({ success: true, count: children.length, data: children });
}

/** POST /api/categories  (admin only) */
export function createCategory(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as { slug?: string; parentId?: string; name: string };

  // Check slug uniqueness if provided
  if (body.slug && categoriesStore.getBySlug(body.slug)) {
    next(new ApiError(409, `A category with slug '${body.slug}' already exists.`));
    return;
  }

  const { parentId } = body;
  if (parentId) {
    const parent = categoriesStore.getById(parentId);
    if (!parent) {
      next(new ApiError(400, `Parent category with id '${parentId}' does not exist.`));
      return;
    }
    if (!isAccessoriesDescendant(parentId)) {
      next(new ApiError(400, 'Only subcategories belonging to Accessories can have a parent category.'));
      return;
    }
  }

  const category = categoriesStore.create(body);
  res.status(201).json({ success: true, data: category });
}

/** PUT /api/categories/:id  (admin only) */
export function updateCategory(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;
  const category = categoriesStore.getById(id!);
  if (!category) {
    next(new ApiError(404, `Category with id '${id}' was not found.`));
    return;
  }

  const body = req.body as { parentId?: string };
  const { parentId } = body;
  if (parentId) {
    const parent = categoriesStore.getById(parentId);
    if (!parent) {
      next(new ApiError(400, `Parent category with id '${parentId}' does not exist.`));
      return;
    }
    if (categoriesStore.wouldCreateCycle(id!, parentId)) {
      next(new ApiError(400, 'Circular relationship detected. A category cannot be its own parent or descendant\'s child.'));
      return;
    }
    if (!isAccessoriesDescendant(parentId)) {
      next(new ApiError(400, 'Only subcategories belonging to Accessories can have a parent category.'));
      return;
    }
  }

  const updated = categoriesStore.update(id!, req.body);
  res.status(200).json({ success: true, data: updated });
}

/** DELETE /api/categories/:id  (admin only) */
export function deleteCategory(req: Request, res: Response, next: NextFunction): void {
  const category = categoriesStore.getById(req.params['id']!);
  if (!category) {
    next(new ApiError(404, `Category with id '${req.params['id']}' was not found.`));
    return;
  }

  // Find all descendant categories
  const descendants = categoriesStore.getDescendants(req.params['id']!);
  const categoriesToDelete = [category, ...descendants];

  // Find all products in all these categories
  const allProducts = menuItemsStore.getAll();
  const categorySlugs = categoriesToDelete.map((c) => c.slug.toLowerCase());

  const productsToDelete = allProducts.filter(
    (p) => p.category && categorySlugs.includes(p.category.toLowerCase())
  );

  let deletedProductsCount = 0;
  for (const product of productsToDelete) {
    menuItemsStore.remove(product.id);
    deletedProductsCount++;
  }

  // Delete the categories themselves
  for (const cat of categoriesToDelete) {
    categoriesStore.remove(cat.id);
  }

  res.status(200).json({
    success: true,
    message: `Category '${category.name}' and ${descendants.length} subcategories, along with ${deletedProductsCount} product(s) deleted successfully.`,
    deletedProductsCount,
    deletedCategoriesCount: categoriesToDelete.length,
  });
}

/** PUT /api/categories/reorder  (admin only) */
export function reorderCategories(req: Request, res: Response, next: NextFunction): void {
  const { orderedIds } = req.body as { orderedIds?: unknown };

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    next(new ApiError(400, "'orderedIds' must be a non-empty array of category IDs."));
    return;
  }

  const categories = categoriesStore.reorder(orderedIds as string[]);
  res.status(200).json({ success: true, data: categories });
}
