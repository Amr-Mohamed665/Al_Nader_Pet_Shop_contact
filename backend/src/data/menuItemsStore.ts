import fs from 'fs';
import path from 'path';
import type { MenuItem, MenuFilters } from '../types/index';

const DATA_FILE = path.join(__dirname, 'menuItems.json');

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cache: MenuItem[] | null = null;

function readAll(): MenuItem[] {
  if (cache !== null) return cache;
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  cache = JSON.parse(raw) as MenuItem[];
  return cache;
}

function writeAll(items: MenuItem[]): void {
  cache = items; // update cache immediately
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export function getAll(filters: MenuFilters = {}): MenuItem[] {
  const { search, category, availableOnly } = filters;
  let items = readAll();

  if (category) {
    items = items.filter((i) => i.category.toLowerCase() === String(category).toLowerCase());
  }
  if (search) {
    const term = String(search).toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(term));
  }
  if (availableOnly) {
    items = items.filter((i) => i.available !== false);
  }

  return items;
}

export function getById(id: string): MenuItem | undefined {
  return readAll().find((i) => i.id === String(id));
}

type CreateMenuItemData = Omit<MenuItem, 'id' | 'createdAt'>;

export function create(data: Partial<CreateMenuItemData> & { name: string; price: number }): MenuItem {
  const items = readAll();

  const newItem: MenuItem = {
    id: Date.now().toString(),
    name: data.name,
    category: data.category ?? 'Main Course',
    price: Number(data.price),
    description: data.description ?? '',
    image: data.image ?? '',
    available: data.available !== undefined ? Boolean(data.available) : true,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  writeAll(items);
  return newItem;
}

export function update(id: string, data: Partial<MenuItem>): MenuItem | null {
  const items = readAll();
  const index = items.findIndex((i) => i.id === String(id));
  if (index === -1) return null;

  const existing = items[index];
  const updated: MenuItem = {
    ...existing,
    name: data.name ?? existing.name,
    category: data.category ?? existing.category,
    price: data.price !== undefined ? Number(data.price) : existing.price,
    description: data.description ?? existing.description,
    image: data.image ?? existing.image,
    available: data.available !== undefined ? Boolean(data.available) : existing.available,
  };

  items[index] = updated;
  writeAll(items);
  return updated;
}

export function remove(id: string): boolean {
  const items = readAll();
  const index = items.findIndex((i) => i.id === String(id));
  if (index === -1) return false;

  items.splice(index, 1);
  writeAll(items);
  return true;
}

export function reorder(orderedIds: string[]): MenuItem[] {
  const items = readAll();
  const itemMap = new Map(items.map((item) => [String(item.id), item]));
  const reordered: MenuItem[] = [];

  orderedIds.forEach((id) => {
    const item = itemMap.get(String(id));
    if (item) {
      reordered.push(item);
      itemMap.delete(String(id));
    }
  });

  // Append any remaining items that weren't specified in orderedIds
  for (const item of itemMap.values()) {
    reordered.push(item);
  }

  writeAll(reordered);
  return reordered;
}
