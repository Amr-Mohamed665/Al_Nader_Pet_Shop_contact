import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { UserRecord, PublicUser, UserRole } from '../types/index';

const DATA_FILE = path.join(__dirname, 'users.json');
const SALT_ROUNDS = 10;

function readAll(): UserRecord[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as UserRecord[];
}

function writeAll(users: UserRecord[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

/** Never return the password hash to a controller/response by accident. */
function toPublicUser(user: UserRecord): PublicUser;
function toPublicUser(user: undefined | null): undefined;
function toPublicUser(user: UserRecord | undefined | null): PublicUser | undefined;
function toPublicUser(user: UserRecord | undefined | null): PublicUser | undefined {
  if (!user) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...publicUser } = user;
  return publicUser;
}

export function getAll(): PublicUser[] {
  return readAll().map(toPublicUser as (u: UserRecord) => PublicUser);
}

export function getById(id: string): PublicUser | undefined {
  return toPublicUser(readAll().find((u) => u.id === String(id)));
}

/**
 * Internal-only — includes the password hash.
 * Used by the auth controller to check credentials, never sent back in a response.
 */
export function getByEmailWithPassword(email: string): UserRecord | undefined {
  return readAll().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

export function emailExists(email: string): boolean {
  return !!getByEmailWithPassword(email);
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export async function create({ name, email, password, role }: CreateUserData): Promise<PublicUser> {
  const users = readAll();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser: UserRecord = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    // Registration can only ever create a "user" — role is never
    // trusted from client input. Admin accounts are seeded separately.
    role: role === 'admin' ? 'user' : role ?? 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeAll(users);
  return toPublicUser(newUser);
}

export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

interface UpdateUserData {
  name?: string;
  email?: string;
}

export function update(id: string, data: UpdateUserData): PublicUser | null {
  const users = readAll();
  const index = users.findIndex((u) => u.id === String(id));
  if (index === -1) return null;

  const existing = users[index];
  const updated: UserRecord = {
    ...existing,
    name: data.name ?? existing.name,
    email: data.email ? data.email.toLowerCase() : existing.email,
    // role is deliberately NOT updatable through this generic update —
    // promoting/demoting users is a separate, admin-only action.
  };

  users[index] = updated;
  writeAll(users);
  return toPublicUser(updated);
}

export function setRole(id: string, role: UserRole): PublicUser | null {
  const users = readAll();
  const index = users.findIndex((u) => u.id === String(id));
  if (index === -1) return null;

  users[index].role = role;
  writeAll(users);
  return toPublicUser(users[index]);
}

export function remove(id: string): boolean {
  const users = readAll();
  const index = users.findIndex((u) => u.id === String(id));
  if (index === -1) return false;

  users.splice(index, 1);
  writeAll(users);
  return true;
}

/**
 * Used only by the startup seeding script — bypasses the
 * "register can't create admins" rule on purpose.
 */
export async function createAdmin({ name, email, password }: Omit<CreateUserData, 'role'>): Promise<PublicUser> {
  const users = readAll();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin: UserRecord = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'admin',
    createdAt: new Date().toISOString(),
  };

  users.push(admin);
  writeAll(users);
  return toPublicUser(admin);
}

export { toPublicUser };
