import type { Request, Response, NextFunction } from 'express';
import { sendContactEmail } from '../utils/mailer';
import ApiError from '../utils/ApiError';

/** POST /api/contact */
export async function submitContactForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    if (!name || !email || !subject || !message) {
      throw new ApiError(400, 'All fields (name, email, subject, message) are required.');
    }

    const emailResult = await sendContactEmail({ name, email, subject, message });

    res.status(200).json({
      success: true,
      message: 'Message received and email notification sent.',
      data: { name, email, subject, emailSent: emailResult.success },
    });
  } catch (err) {
    next(err);
  }
}
