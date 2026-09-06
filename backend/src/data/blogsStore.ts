import fs from 'fs';
import path from 'path';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
}

const DATA_FILE = path.join(__dirname, 'blogs.json');
const SEED_FILE = path.join(__dirname, 'blogs.seed.json');

let cache: BlogPost[] | null = null;

function readAll(): BlogPost[] {
  if (cache !== null) return cache;
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      const seedData = fs.readFileSync(SEED_FILE, 'utf-8');
      fs.writeFileSync(DATA_FILE, seedData, 'utf-8');
    } else {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
    }
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    cache = JSON.parse(raw) as BlogPost[];
  } catch {
    cache = [];
  }
  return cache;
}

function writeAll(items: BlogPost[]): void {
  cache = items;
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export function getAll(filters: { search?: string; category?: string } = {}): BlogPost[] {
  const { search, category } = filters;
  let items = readAll();

  if (category && category.toLowerCase() !== 'all') {
    items = items.filter((b) => b.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const term = search.toLowerCase();
    items = items.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.excerpt.toLowerCase().includes(term) ||
        b.category.toLowerCase().includes(term) ||
        b.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  return items;
}

export function getBySlugOrId(idOrSlug: string): BlogPost | undefined {
  const items = readAll();
  return items.find((b) => b.id === idOrSlug || b.slug === idOrSlug);
}

export function create(data: Omit<BlogPost, 'id' | 'publishedAt'> & { slug?: string }): BlogPost {
  const items = readAll();
  const titleSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const slug = data.slug || titleSlug;

  const newPost: BlogPost = {
    id: Date.now().toString(),
    title: data.title,
    slug: slug || `post-${Date.now()}`,
    excerpt: data.excerpt || '',
    content: data.content || '',
    category: data.category || 'General',
    image: data.image || '',
    author: data.author || 'Al Nader Pet Care Team',
    readTime: data.readTime || '5 min read',
    publishedAt: new Date().toISOString(),
    tags: data.tags || ['Pet Care'],
  };

  items.unshift(newPost);
  writeAll(items);
  return newPost;
}

export function update(id: string, data: Partial<BlogPost>): BlogPost | undefined {
  const items = readAll();
  const index = items.findIndex((b) => b.id === id);
  if (index === -1) return undefined;

  const updated: BlogPost = {
    ...items[index],
    ...data,
    id: items[index].id,
  };

  items[index] = updated;
  writeAll(items);
  return updated;
}

export function remove(id: string): boolean {
  const items = readAll();
  const index = items.findIndex((b) => b.id === id);
  if (index === -1) return false;

  items.splice(index, 1);
  writeAll(items);
  return true;
}
