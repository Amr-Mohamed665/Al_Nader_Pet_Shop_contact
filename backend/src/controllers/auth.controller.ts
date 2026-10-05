import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import * as usersStore from '../data/usersStore';
import ApiError from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import { sendMail } from '../utils/mailer';

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

/** PATCH /api/auth/change-password  (protected) */
export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };

    if (!currentPassword || !newPassword) {
      next(new ApiError(400, 'Both currentPassword and newPassword are required.'));
      return;
    }

    if (newPassword.length < 6) {
      next(new ApiError(400, 'New password must be at least 6 characters.'));
      return;
    }

    // Fetch the full record (including the stored hash)
    const userRecord = usersStore.getByEmailWithPassword(req.user!.email);
    if (!userRecord) {
      next(new ApiError(404, 'Account not found.'));
      return;
    }

    const passwordMatches = await usersStore.verifyPassword(currentPassword, userRecord.password);
    if (!passwordMatches) {
      next(new ApiError(401, 'Current password is incorrect.'));
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await usersStore.updatePassword(req.user!.id, newHash);

    res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── ADMIN-ONLY USER MANAGEMENT ───────────────────────────────────────────────

/** GET /api/auth/users  (admin only) */
export function listUsers(_req: Request, res: Response, next: NextFunction): void {
  try {
    const users = usersStore.getAll();
    res.status(200).json({ success: true, data: users, count: users.length });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/auth/users/:id/role  (admin only) */
export function setUserRole(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;
    const { role } = req.body as { role: string };

    if (role !== 'admin' && role !== 'user') {
      next(new ApiError(400, 'Role must be either "admin" or "user".'));
      return;
    }

    // Prevent admins from removing their own admin role
    if (req.user!.id === id && role !== 'admin') {
      next(new ApiError(400, 'You cannot remove your own admin privileges.'));
      return;
    }

    const updated = usersStore.setRole(id, role as 'admin' | 'user');
    if (!updated) {
      next(new ApiError(404, 'User not found.'));
      return;
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/auth/users/:id  (admin only) */
export function deleteUser(req: Request, res: Response, next: NextFunction): void {
  try {
    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (req.user!.id === id) {
      next(new ApiError(400, 'You cannot delete your own account from the admin panel.'));
      return;
    }

    const removed = usersStore.remove(id);
    if (!removed) {
      next(new ApiError(404, 'User not found.'));
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/users/bulk-email  (admin only) */
export async function sendBulkEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { recipients, subject, message } = req.body as {
      recipients?: string[];
      subject?: string;
      message?: string;
    };

    if (!Array.isArray(recipients) || recipients.length === 0) {
      next(new ApiError(400, 'At least one recipient email address is required.'));
      return;
    }

    if (!subject || !subject.trim()) {
      next(new ApiError(400, 'Email subject is required.'));
      return;
    }

    if (!message || !message.trim()) {
      next(new ApiError(400, 'Email message content is required.'));
      return;
    }

    let successCount = 0;
    let failCount = 0;
    let isMock = false;

    // Safe HTML formatting with linebreaks
    const safeMsg = message.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>');
    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #0d9488; font-size: 20px; margin: 0; font-weight: 800;">Al Nader Pet Shop 🐾</h1>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Official Announcement & Update</p>
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin-bottom: 20px;" />
        <div style="font-size: 14px; line-height: 1.6; color: #1e293b;">
          ${safeMsg}
        </div>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0 16px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
          Sent from Al Nader Pet Shop Admin • Dubai, UAE
        </p>
      </div>
    `;

    for (const email of recipients) {
      const result = await sendMail({
        to: email,
        subject,
        text: message,
        html: formattedHtml,
      });

      if (result.success) {
        successCount++;
        if (result.mock) isMock = true;
      } else {
        failCount++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        sentCount: successCount,
        failedCount: failCount,
        totalTargeted: recipients.length,
        mock: isMock,
      },
      message: `Successfully processed ${successCount} email(s).`,
    });
  } catch (err) {
    next(err);
  }
}
