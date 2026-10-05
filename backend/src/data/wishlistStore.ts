import fs from 'fs';
import path from 'path';
import type { WishlistEntry } from '../types/index';

const DATA_FILE = path.join(__dirname, 'wishlist.json');

function readAll(): WishlistEntry[] {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as WishlistEntry[];
  } catch {
    return [];
  }
}

function writeAll(wishlist: WishlistEntry[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(wishlist, null, 2), 'utf-8');
}

export function getByUser(userId: string): WishlistEntry[] {
  return readAll().filter((item) => item.userId === String(userId));
}

export function add(userId: string, productId: string): WishlistEntry | null {
  const wishlist = readAll();
  const exists = wishlist.some(
    (item) => item.userId === String(userId) && item.productId === String(productId)
  );
  if (exists) return null;

  const newItem: WishlistEntry = {
    userId: String(userId),
    productId: String(productId),
    addedAt: new Date().toISOString(),
  };

  wishlist.push(newItem);
  writeAll(wishlist);
  return newItem;
}

export function remove(userId: string, productId: string): boolean {
  const wishlist = readAll();
  const index = wishlist.findIndex(
    (item) => item.userId === String(userId) && item.productId === String(productId)
  );
  if (index === -1) return false;

  wishlist.splice(index, 1);
  writeAll(wishlist);
  return true;
}

export function check(userId: string, productId: string): boolean {
  return readAll().some(
    (item) => item.userId === String(userId) && item.productId === String(productId)
  );
}

export function clearUser(userId: string): boolean {
  const wishlist = readAll();
  const filtered = wishlist.filter((item) => item.userId !== String(userId));
  writeAll(filtered);
  return true;
}
