import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.any().transform((val, ctx) => {
    if (val === '' || val === null || val === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required',
      });
      return z.NEVER;
    }
    const num = Number(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price is required',
      });
      return z.NEVER;
    }
    if (num < 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Price must be greater than 0',
      });
      return z.NEVER;
    }
    return num;
  }),
  description: z.string().optional(),
  image: z.string().url('Must be a valid URL starting with http:// or https://').or(z.literal('')),
  available: z.boolean().default(true),
});

const UAE_EMIRATES = ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'] as const;

export const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be 100 characters or fewer'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => {
      const cleaned = val.replace(/[\s\-()]/g, '');
      const UAE_PHONE_REGEX = /^(\+971|00971|971|0)?(5[0-9]\d{7}|[2-4679]\d{7})$/;
      return UAE_PHONE_REGEX.test(cleaned);
    },
    { message: 'Please enter a valid UAE phone number (e.g. 05x xxx xxxx)' }
  ),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  emirate: z.enum(UAE_EMIRATES, {
    message: 'Please select a valid UAE emirate',
  }),
  area: z.string().min(1, 'Area / Community is required').max(100, 'Area must be 100 characters or fewer'),
  street: z.string().min(1, 'Street name is required').max(200, 'Street must be 200 characters or fewer'),
  building: z.string().min(1, 'Building or Villa is required').max(100, 'Building must be 100 characters or fewer'),
  floor: z.string().max(20, 'Floor must be 20 characters or fewer').optional().or(z.literal('')),
  apartment: z.string().max(50, 'Apartment/Unit must be 50 characters or fewer').optional().or(z.literal('')),
  landmark: z.string().max(200, 'Landmark must be 200 characters or fewer').optional().or(z.literal('')),
  instructions: z.string().max(500, 'Instructions must be 500 characters or fewer').optional().or(z.literal('')),
  orderNotes: z.string().max(500, 'Order notes must be 500 characters or fewer').optional().or(z.literal('')),
  paymentMethod: z.enum(['cod', 'card'] as const).default('cod'),
});
