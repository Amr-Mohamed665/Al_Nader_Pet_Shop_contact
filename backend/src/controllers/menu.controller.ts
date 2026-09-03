import type { Request, Response, NextFunction } from 'express';
import * as menuItemsStore from '../data/menuItemsStore';
import * as categoriesStore from '../data/categoriesStore';
import ApiError from '../utils/ApiError';

/** GET /api/menu?search=&category=&all=true  (public or admin depending on params) */
export function getMenu(req: Request, res: Response): void {
  const { search, category, all } = req.query as Record<string, string | undefined>;
  const availableOnly = all !== 'true';
  const items = menuItemsStore.getAll({ search, category, availableOnly });
  res.status(200).json({ success: true, count: items.length, data: items });
}

/** GET /api/menu/:id  (public) */
export function getMenuItem(req: Request, res: Response, next: NextFunction): void {
  const item = menuItemsStore.getById(req.params['id']!);
  if (!item) {
    next(new ApiError(404, `Menu item with id '${req.params['id']}' was not found.`));
    return;
  }
  res.status(200).json({ success: true, data: item });
}

/** POST /api/menu  (admin only) */
export function createMenuItem(req: Request, res: Response): void {
  const item = menuItemsStore.create(req.body);
  res.status(201).json({ success: true, data: item });
}

/** PUT /api/menu/:id  (admin only) */
export function updateMenuItem(req: Request, res: Response, next: NextFunction): void {
  const updated = menuItemsStore.update(req.params['id']!, req.body);
  if (!updated) {
    next(new ApiError(404, `Menu item with id '${req.params['id']}' was not found.`));
    return;
  }
  res.status(200).json({ success: true, data: updated });
}

/** DELETE /api/menu/:id  (admin only) */
export function deleteMenuItem(req: Request, res: Response, next: NextFunction): void {
  const deleted = menuItemsStore.remove(req.params['id']!);
  if (!deleted) {
    next(new ApiError(404, `Menu item with id '${req.params['id']}' was not found.`));
    return;
  }
  res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
}

/** PUT /api/menu/reorder (admin only) */
export function reorderMenuItems(req: Request, res: Response, next: NextFunction): void {
  const { ids } = req.body as { ids?: unknown };
  if (!Array.isArray(ids)) {
    next(new ApiError(400, "Request body must contain an 'ids' array."));
    return;
  }
  const items = menuItemsStore.reorder(ids as string[]);
  res.status(200).json({ success: true, data: items });
}

/** GET /api/menu/:id/recommended-accessories (public) */
export function getRecommendedAccessories(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const currentProduct = menuItemsStore.getById(id!);
    if (!currentProduct) {
      next(new ApiError(404, `Product with id '${id}' was not found.`));
      return;
    }

    const categorySlug = currentProduct.category;
    if (!categorySlug) {
      res.status(200).json({ success: true, count: 0, data: [] });
      return;
    }

    const isDog = categorySlug.toLowerCase().includes('dog');
    const isCat = categorySlug.toLowerCase().includes('cat');
    const isBird = categorySlug.toLowerCase().includes('bird');
    const isHamster = categorySlug.toLowerCase().includes('hamster');
    const isReptile = categorySlug.toLowerCase().includes('reptile') || categorySlug.toLowerCase().includes('reptil');

    const allCategories = categoriesStore.getAll();
    const targetCategorySlugs = allCategories
      .filter((c) => {
        if (!c.isAccessory) return false;
        const nameLower = c.name.toLowerCase();
        const slugLower = c.slug.toLowerCase();
        if (isDog && (nameLower.includes('dog') || slugLower.includes('dog'))) return true;
        if (isCat && (nameLower.includes('cat') || slugLower.includes('cat'))) return true;
        if (isBird && (nameLower.includes('bird') || slugLower.includes('bird'))) return true;
        if (isHamster && (nameLower.includes('hamster') || slugLower.includes('hamster'))) return true;
        if (isReptile && (nameLower.includes('reptil') || slugLower.includes('reptil'))) return true;
        return false;
      })
      .map((c) => c.slug.toLowerCase());

    const allProducts = menuItemsStore.getAll();
    const recommended = allProducts.filter((p) => {
      if (!p.category) return false;
      const pCatLower = p.category.toLowerCase();
      return (
        targetCategorySlugs.includes(pCatLower) &&
        p.id !== currentProduct.id &&
        p.available !== false
      );
    });

    res.status(200).json({
      success: true,
      count: recommended.length,
      data: recommended,
    });
  } catch (err) {
    next(err);
  }
}
