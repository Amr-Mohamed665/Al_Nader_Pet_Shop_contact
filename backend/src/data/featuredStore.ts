import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(__dirname, 'featured.json');

// ─── In-memory cache ──────────────────────────────────────────────────────────
let cache: string[] | null = null;

export function get(): string[] {
  if (cache !== null) return cache;
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    cache = JSON.parse(raw) as string[];
    return cache;
  } catch {
    cache = [];
    return cache;
  }
}

export function set(ids: string[]): void {
  cache = ids; // update cache immediately
  fs.writeFileSync(DATA_FILE, JSON.stringify(ids, null, 2), 'utf-8');
}
