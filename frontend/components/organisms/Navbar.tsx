'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/atoms/Logo';
import Avatar from '@/components/atoms/Avatar';
import Button from '@/components/atoms/Button';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useCategoriesQuery, useAccessoriesTree } from '@/hooks/useCategories';
import { useWishlistQuery } from '@/hooks/useWishlist';
import type { Category } from '@/types';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { count } = useCart();
  const { data: categories = [] } = useCategoriesQuery();
  const { tree: accessoriesTree } = useAccessoriesTree();
  const { data: wishlistItems = [] } = useWishlistQuery();
  const wishlistCount = wishlistItems.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Mobile accordions state
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);
  const [mobileGroupsOpen, setMobileGroupsOpen] = useState<Record<string, boolean>>({});

  // Close mobile menu when route changes (during render to avoid cascading renders)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
    setMobileCategoriesOpen(false);
    setMobileAccessoriesOpen(false);
    setMobileGroupsOpen({});
  }

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getCategoryImageUrl = (cat?: Category, fallbackSlug?: string) => {
    if (cat?.image) return cat.image;
    const s = (cat?.slug || fallbackSlug || '').toLowerCase();
    if (s.includes('dog')) return 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1074&auto=format&fit=crop';
    if (s.includes('cat')) return 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1043&auto=format&fit=crop';
    if (s.includes('bird')) return '/images/birds-category.jpg';
    if (s.includes('hamster')) return 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?q=80&w=1076&auto=format&fit=crop';
    if (s.includes('reptile')) return 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?q=80&w=880&auto=format&fit=crop';
    if (s.includes('accessories') || s.includes('accessory')) return '/images/accessories-category.jpg';
    return '/images/accessories-category.jpg';
  };

  const preferredOrder = ['hamster', 'dogs', 'cats', 'birds', 'reptiles'];

  // Filter top-level categories (dogs, cats, birds, hamster, reptiles) - exclude accessories
  const topCategories = categories
    .filter(
      (c) =>
        !c.isAccessory &&
        (c.parentId === null || c.parentId === undefined) &&
        c.slug !== 'accessories' &&
        !c.slug.toLowerCase().includes('accessories') &&
        !c.slug.toLowerCase().includes('accessory') &&
        !c.name.toLowerCase().includes('accessories') &&
        !c.name.toLowerCase().includes('accessory')
    )
    .sort((a, b) => {
      const idxA = preferredOrder.findIndex((p) => a.slug.toLowerCase().includes(p));
      const idxB = preferredOrder.findIndex((p) => b.slug.toLowerCase().includes(p));
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return (a.order ?? 0) - (b.order ?? 0);
    });

  const accessoriesCategory = categories.find(
    (c) => c.slug === 'accessories' || c.slug.toLowerCase().includes('accessories')
  );

  const toggleMobileGroup = (groupId: string) => {
    setMobileGroupsOpen((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[80px] py-2 justify-between items-center">
            {/* Logo & Fancy Handwritten Slogan Underneath */}
            <div className="flex flex-col items-center justify-center">
              <div className="flex-shrink-0 bg-white rounded-xl px-2 py-1 border border-slate-200/80 shadow-sm">
                <Logo />
              </div>
              <span
                className="text-sm sm:text-base md:text-lg font-medium text-purple-700 tracking-wide leading-none select-none mt-1 whitespace-nowrap"
                style={{ fontFamily: 'var(--font-satisfy), var(--font-great-vibes), cursive' }}
              >
                Where Pets Become Family
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                href="/"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/about') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                About Us
              </Link>

              {/* Categories Dropdown Menu (Clean Text Only) */}
              <div className="relative group py-4">
                <button
                  className={`text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive('/products') || isActive('/category') || isActive('/accessories')
                      ? 'text-purple-600 font-extrabold'
                      : 'text-slate-600 hover:text-purple-500'
                  }`}
                >
                  <span>Categories</span>
                  <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-hover:rotate-180 duration-200" />
                </button>

                {/* Dropdown Menu */}
                <div className="absolute top-full left-0 mt-1 w-60 max-h-[82vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-2 animate-scale-in">
                  {/* All Products */}
                  <Link
                    href="/products"
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-extrabold text-purple-600 hover:bg-purple-50 transition-colors"
                  >
                    All Products
                  </Link>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Pet Categories: Hamster, Dogs, Cats, Birds, Reptiles */}
                  <div className="space-y-0.5">
                    {topCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        className="block px-3.5 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-purple-600 hover:bg-slate-50 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Accessories */}
                  <Link
                    href="/accessories"
                    className="block px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-800 hover:text-purple-600 hover:bg-slate-50 transition-colors"
                  >
                    Accessories
                  </Link>

                  {/* Accessories Tree sub-links */}
                  {accessoriesTree.length > 0 && (
                    <div className="mt-1 pt-1 border-t border-slate-100/80 space-y-0.5">
                      {accessoriesTree.map((group) => {
                        const displayName = group.name.toLowerCase().includes('accessories') || group.name.toLowerCase().includes('accessory')
                          ? group.name
                          : `${group.name} Accessories`;
                        return (
                          <Link
                            key={group.id}
                            href={`/accessories/${group.slug}`}
                            className="block px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-purple-600 hover:bg-purple-50/50 rounded-lg transition-colors capitalize"
                          >
                            {displayName}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/blog"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/blog') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/contact') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                Contact Us
              </Link>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Wishlist Button */}
              <Link
                href="/wishlist"
                className="relative p-2 text-slate-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all select-none"
                title="My Wishlist"
              >
                <i className="fa-solid fa-heart text-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="relative p-2 text-slate-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all select-none"
                title="Open Cart"
              >
                <i className="fa-solid fa-bag-shopping text-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {count}
                  </span>
                )}
              </Link>

              {/* Auth Dropdown / Buttons */}
              {loading ? (
                <div className="h-8 w-20 bg-slate-100 rounded-xl animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen((prev) => !prev)}
                    className="flex items-center"
                  >
                    <Avatar name={user?.name} />
                  </button>

                  {profileDropdownOpen && (
                    <>
                      {/* Backdrop to close dropdown */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-black/5 z-20 border border-slate-100 animate-scale-in">
                        <div className="px-3 py-2 border-b border-slate-100 mb-1">
                          <p className="text-xs font-bold text-slate-800 truncate">{user?.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                        </div>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex w-full items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg hover:text-purple-600"
                          >
                            <i className="fa-solid fa-gear mr-2 text-slate-400" /> Admin Dashboard
                          </Link>
                        )}

                        <Link
                          href="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg hover:text-purple-600"
                        >
                          <i className="fa-solid fa-box mr-2 text-slate-400" /> My Orders
                        </Link>

                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-lg hover:text-purple-600"
                        >
                          <i className="fa-solid fa-user mr-2 text-slate-400" /> Profile
                        </Link>

                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="flex w-full items-center px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                        >
                          <i className="fa-solid fa-right-from-bracket mr-2" /> Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    size="md"
                    href="/login"
                    className="px-5 py-2 text-sm font-extrabold text-purple-700 border-purple-200 hover:bg-purple-50 hover:border-purple-300 rounded-xl transition-all shadow-xs"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    href="/register"
                    className="px-5 py-2 text-sm font-extrabold text-white bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 rounded-xl shadow-md shadow-purple-600/25 transition-all hover:scale-102"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile: Wishlist + Cart + Hamburger */}
            <div className="lg:hidden flex items-center gap-1">

              {/* Wishlist Icon */}
              <Link
                href="/wishlist"
                className="relative p-2 text-slate-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all"
              >
                <i className="fa-solid fa-heart text-[18px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Icon */}
              <Link
                href="/cart"
                className="relative p-2 text-slate-500 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-all"
              >
                <i className="fa-solid fa-bag-shopping text-[18px]" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white ring-2 ring-white">
                    {count}
                  </span>
                )}
              </Link>

              {/* Hamburger Button */}
              <button
                onClick={() => { setMenuOpen((prev) => !prev); }}
                className="p-2 text-slate-600 hover:text-purple-500 rounded-lg hover:bg-purple-50 transition-all"
              >
                {menuOpen ? (
                  <i className="fa-solid fa-xmark text-[20px]" />
                ) : (
                  <i className="fa-solid fa-bars text-[20px]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-16 left-0 right-0 bottom-0 z-40 lg:hidden bg-white overflow-y-auto animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/about"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/about') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                About Us
              </Link>

              {/* Categories Accordion on Mobile (Clean Text Only) */}
              <div className="border-b border-slate-100 pb-1">
                <button
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                  className={`w-full flex items-center justify-between px-3 py-3 text-sm font-bold rounded-lg transition-all ${
                    isActive('/products') || isActive('/category') || isActive('/accessories')
                      ? 'bg-purple-50 text-purple-600 font-extrabold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Categories</span>
                  <i
                    className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                      mobileCategoriesOpen ? 'rotate-180 text-purple-600' : ''
                    }`}
                  />
                </button>

                {mobileCategoriesOpen && (
                  <div className="pl-3 pr-2 space-y-1 mt-1 bg-slate-50/70 rounded-xl p-2 border border-slate-100">
                    {/* All Products */}
                    <Link
                      href="/products"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-extrabold text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      All Products
                    </Link>

                    {/* Top Categories: Hamster, Dogs, Cats, Birds, Reptiles */}
                    {topCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg capitalize"
                      >
                        {cat.name}
                      </Link>
                    ))}

                    {/* Accessories */}
                    <div className="border-t border-slate-200/60 pt-1 mt-1">
                      <Link
                        href="/accessories"
                        onClick={() => setMenuOpen(false)}
                        className="block px-3 py-2 text-xs font-bold text-slate-800 hover:bg-purple-50 rounded-lg"
                      >
                        Accessories
                      </Link>
                      {accessoriesTree.length > 0 && (
                        <div className="pl-3 space-y-1 mt-1">
                          {accessoriesTree.map((group) => {
                            const displayName = group.name.toLowerCase().includes('accessories') || group.name.toLowerCase().includes('accessory')
                              ? group.name
                              : `${group.name} Accessories`;
                            return (
                              <Link
                                key={group.id}
                                href={`/accessories/${group.slug}`}
                                onClick={() => setMenuOpen(false)}
                                className="block px-3 py-1.5 text-[11px] font-medium text-slate-600 hover:text-purple-600 hover:bg-white rounded-md capitalize"
                              >
                                {displayName}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/blog') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Blog
              </Link>

              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/contact') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contact Us
              </Link>

              <hr className="border-slate-100 !my-3" />

              {loading ? (
                <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />
              ) : isAuthenticated ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Avatar name={user?.name} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-slate-800 truncate">{user?.name}</span>
                      <span className="text-xs text-slate-500 truncate">{user?.email}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                      >
                        <i className="fa-solid fa-gear mr-2 text-slate-400" /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <i className="fa-solid fa-box mr-2 text-slate-400" /> My Orders
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
                    >
                      <i className="fa-solid fa-user mr-2 text-slate-400" /> Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <i className="fa-solid fa-right-from-bracket mr-2" /> Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full py-3 text-base font-bold text-purple-700 border-purple-200 hover:bg-purple-50 rounded-xl"
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full py-3 text-base font-extrabold text-white bg-purple-600 hover:bg-purple-500 focus:ring-purple-500 rounded-xl shadow-md shadow-purple-600/25"
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
