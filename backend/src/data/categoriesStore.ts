import fs from 'fs';
import path from 'path';
import type { Category } from '../types/index';

const DATA_FILE = path.join(__dirname, 'categories.json');

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cache: Category[] | null = null;

function readAll(): Category[] {
  if (cache !== null) return cache;
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  cache = JSON.parse(raw) as Category[];
  return cache;
}

function writeAll(categories: Category[]): void {
  cache = categories; // update cache immediately
  fs.writeFileSync(DATA_FILE, JSON.stringify(categories, null, 2), 'utf-8');
}

export function getAll(): Category[] {
  return readAll().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getById(id: string): Category | undefined {
  return readAll().find((c) => c.id === String(id));
}

export function getBySlug(slug: string): Category | undefined {
  return readAll().find((c) => c.slug.toLowerCase() === String(slug).toLowerCase());
}

export function getChildren(parentId: string | null): Category[] {
  const pId = parentId ? String(parentId) : null;
  return readAll()
    .filter((c) => c.parentId === pId)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getDescendants(id: string): Category[] {
  const descendants: Category[] = [];
  const children = getChildren(id);
  descendants.push(...children);
  for (const child of children) {
    descendants.push(...getDescendants(child.id));
  }
  return descendants;
}

export function getAncestors(id: string): Category[] {
  const ancestors: Category[] = [];
  let current = getById(id);
  while (current && current.parentId) {
    const parent = getById(current.parentId);
    if (parent) {
      ancestors.unshift(parent);
      current = parent;
    } else {
      break;
    }
  }
  return ancestors;
}

export function wouldCreateCycle(id: string, newParentId: string): boolean {
  if (!id || !newParentId) return false;
  if (String(id) === String(newParentId)) return true;

  const descendants = getDescendants(id);
  return descendants.some((d) => String(d.id) === String(newParentId));
}

type CreateCategoryData = Omit<Category, 'id' | 'order'>;

export function create(data: Partial<CreateCategoryData> & { name: string; slug?: string }): Category {
  const categories = readAll();
  const maxOrder = categories.reduce((max, c) => Math.max(max, c.order ?? 0), -1);

  const slug = (data.slug && data.slug.trim())
    ? data.slug.trim().toLowerCase()
    : data.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  const newCategory: Category = {
    id: Date.now().toString(),
    name: data.name,
    slug,
    description: data.description ?? '',
    image: data.image ?? '',
    order: maxOrder + 1,
    parentId: data.parentId !== undefined ? (data.parentId ? String(data.parentId) : null) : null,
    isAccessory: data.isAccessory !== undefined ? Boolean(data.isAccessory) : false,
  };

  categories.push(newCategory);
  writeAll(categories);
  return newCategory;
}

export function update(id: string, data: Partial<Category>): Category | null {
  const categories = readAll();
  const index = categories.findIndex((c) => c.id === String(id));
  if (index === -1) return null;

  const existing = categories[index];
  const updated: Category = {
    ...existing,
    name: data.name ?? existing.name,
    slug: data.slug ?? existing.slug,
    description: data.description ?? existing.description,
    image: data.image ?? existing.image,
    parentId: data.parentId !== undefined ? (data.parentId ? String(data.parentId) : null) : existing.parentId,
    isAccessory: data.isAccessory !== undefined ? Boolean(data.isAccessory) : (existing.isAccessory ?? false),
  };

  categories[index] = updated;
  writeAll(categories);
  return updated;
}

export function remove(id: string): Category | null {
  const categories = readAll();
  const index = categories.findIndex((c) => c.id === String(id));
  if (index === -1) return null;

  const removed = categories[index];
  categories.splice(index, 1);
  writeAll(categories);
  return removed;
}

export function reorder(orderedIds: string[]): Category[] {
  const categories = readAll();

  orderedIds.forEach((id, idx) => {
    const cat = categories.find((c) => c.id === String(id));
    if (cat) {
      cat.order = idx;
    }
  });

  writeAll(categories);
  return categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
