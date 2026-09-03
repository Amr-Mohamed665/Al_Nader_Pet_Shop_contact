import type { Request, Response, NextFunction } from 'express';
import * as usersStore from '../data/usersStore';
import ApiError from '../utils/ApiError';
import { signToken } from '../utils/jwt';

/** POST /api/auth/register
 *  Always creates a "user" role account — role is never trusted from
 *  the client, no matter what the request body contains.
 */
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    if (usersStore.emailExists(email)) {
      next(new ApiError(409, 'An account with this email already exists.'));
      return;
    }

    const user = await usersStore.create({ name, email, password, role: 'user' });
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    res.status(201).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const userRecord = usersStore.getByEmailWithPassword(email);
    if (!userRecord) {
      next(new ApiError(401, 'Invalid email or password.'));
      return;
    }

    const passwordMatches = await usersStore.verifyPassword(password, userRecord.password);
    if (!passwordMatches) {
      next(new ApiError(401, 'Invalid email or password.'));
      return;
    }

    const user = usersStore.toPublicUser(userRecord);
    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    res.status(200).json({ success: true, data: { user, token } });
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me  (protected) */
export function me(req: Request, res: Response, next: NextFunction): void {
  const user = usersStore.getById(req.user!.id);
  if (!user) {
    next(new ApiError(404, 'This account no longer exists.'));
    return;
  }
  res.status(200).json({ success: true, data: user });
}
