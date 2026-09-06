import type { NavLink, ContactInfo } from '@/types';

export const SHOP_NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'All Products', href: '/products' },
  { label: 'Dogs', href: '/category/dogs' },
  { label: 'Cats', href: '/category/cats' },
  { label: 'Birds', href: '/category/birds' },
  { label: 'Accessories', href: '/accessories' },
  { label: 'About Us', href: '/about' },
];

export const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Manage Products', href: '/admin/products' },
  { label: 'Manage Categories', href: '/admin/categories' },
  { label: 'Manage Blogs', href: '/admin/blogs' },
  { label: 'Manage Orders', href: '/admin/orders' },
];

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Pet Blog', href: '/blog' },
  { label: 'All Products', href: '/products' },
  { label: 'Dogs', href: '/category/dogs' },
  { label: 'Cats', href: '/category/cats' },
  { label: 'Birds', href: '/category/birds' },
  { label: 'Accessories', href: '/accessories' },
];

export const FOOTER_SUPPORT_LINKS: NavLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Customer Login', href: '/login' },
  { label: 'Create Account', href: '/register' },
  { label: 'Track Orders', href: '/orders' },
  { label: 'Shopping Cart', href: '/cart' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms & Conditions', href: '/terms' },
];

export const CONTACT_INFO: ContactInfo = {
  phone: '+971 50 676 7915',
  email: 'alnaderpetshop@gmail.com',
  address: 'Warsan Third - Warsan 3 - Dubai - United Arab Emirates',
};
