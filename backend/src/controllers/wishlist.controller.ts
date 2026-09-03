import type { Request, Response, NextFunction } from 'express';
import * as wishlistStore from '../data/wishlistStore';
import * as menuItemsStore from '../data/menuItemsStore';
import ApiError from '../utils/ApiError';
import type { MenuItem } from '../types/index';

export function getWishlist(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.user!.id;
    const wishlistItems = wishlistStore.getByUser(userId);

    // Map items to full products — filter out deleted products, keep sold-out ones
    const validProducts = wishlistItems
      .map((item) => menuItemsStore.getById(item.productId))
      .filter((p): p is MenuItem => p !== undefined);

    res.status(200).json({
      success: true,
      count: validProducts.length,
      data: validProducts,
    });
  } catch (err) {
    next(err);
  }
}

export function addToWishlist(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const product = menuItemsStore.getById(productId!);
    if (!product) {
      next(new ApiError(404, `Product with id '${productId}' was not found.`));
      return;
    }

    const added = wishlistStore.add(userId, productId!);
    res.status(200).json({
      success: true,
      message: added ? 'Product added to wishlist.' : 'Product already in wishlist.',
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export function removeFromWishlist(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const removed = wishlistStore.remove(userId, productId!);
    if (!removed) {
      next(new ApiError(404, 'Product was not found in your wishlist.'));
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist.',
    });
  } catch (err) {
    next(err);
  }
}

export function checkWishlist(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const inWishlist = wishlistStore.check(userId, productId!);
    res.status(200).json({
      success: true,
      inWishlist,
    });
  } catch (err) {
    next(err);
  }
}

export function clearWishlist(req: Request, res: Response, next: NextFunction): void {
  try {
    const userId = req.user!.id;
    wishlistStore.clearUser(userId);

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully.',
    });
  } catch (err) {
    next(err);
  }
}
