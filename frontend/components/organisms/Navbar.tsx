'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const { user, isAuthenticated, isAdmin, logout, loading } = useAuth();
  const { count } = useCart();
  const { data: categories = [] } = useCategoriesQuery();
  const { tree: accessoriesTree } = useAccessoriesTree();
  const { data: wishlistItems = [] } = useWishlistQuery();
  const wishlistCount = wishlistItems.length;

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Mobile accordions state
  const [mobileAccessoriesOpen, setMobileAccessoriesOpen] = useState(false);
  const [mobileGroupsOpen, setMobileGroupsOpen] = useState<Record<string, boolean>>({});

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
    setMobileAccessoriesOpen(false);
    setMobileGroupsOpen({});
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Filter top-level categories (dogs, cats, birds, hamster, reptiles) - exclude accessories
  const topCategories = categories.filter(
    (c) =>
      !c.isAccessory &&
      (c.parentId === null || c.parentId === undefined) &&
      c.slug !== 'accessories' &&
      !c.slug.toLowerCase().includes('accessories') &&
      !c.slug.toLowerCase().includes('accessory') &&
      !c.name.toLowerCase().includes('accessories') &&
      !c.name.toLowerCase().includes('accessory')
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
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0 bg-white rounded-xl p-1.5 border border-slate-200/80 shadow-sm">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-5 xl:space-x-6">
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
              <Link
                href="/contact"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/contact') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                className={`text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive('/products') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                }`}
              >
                All Products
              </Link>

              {/* Other Top-Level Pet Categories */}
              {topCategories
                .filter((c) => c.slug !== 'accessories')
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`text-sm font-bold transition-colors whitespace-nowrap ${
                      isActive(`/category/${cat.slug}`)
                        ? 'text-purple-600 font-extrabold'
                        : 'text-slate-600 hover:text-purple-500'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}

              {/* Accessories Hover Mega Menu */}
              <div className="relative group py-4">
                <span
                  className={`text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-1 cursor-default select-none ${
                    isActive('/accessories') ? 'text-purple-600 font-extrabold' : 'text-slate-600 hover:text-purple-500'
                  }`}
                >
                  Accessories
                  <i className="fa-solid fa-chevron-down text-[10px] transition-transform group-hover:rotate-180 duration-200" />
                </span>

                {/* Mega Dropdown */}
                <div className="absolute top-full left-0 mt-1 w-[260px] max-h-[70vh] overflow-y-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 py-2 animate-scale-in">
                  {accessoriesTree.map((group) => {
                    const displayName = group.name.toLowerCase().includes('accessories') || group.name.toLowerCase().includes('accessory')
                      ? group.name
                      : `${group.name} Accessories`;
                    return (
                      <Link
                        key={group.id}
                        href={`/accessories/${group.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:text-purple-600 hover:bg-purple-50/60 transition-all capitalize"
                      >
                        <span>{displayName}</span>
                      </Link>
                    );
                  })}
                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <Link
                      href="/accessories"
                      className="flex items-center justify-between px-3 py-2 text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all group/btn"
                    >
                      View All Accessories
                      <i className="fa-solid fa-arrow-right text-[10px] transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
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
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" href="/login">
                    Login
                  </Button>
                  <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-500 focus:ring-purple-500" href="/register">
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
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/contact') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                Contact Us
              </Link>
              <Link
                href="/products"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                  isActive('/products') ? 'bg-purple-50 text-purple-600 font-extrabold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Products
              </Link>

              {/* Other Top-Level Pet Categories */}
              {topCategories
                .filter((c) => c.slug !== 'accessories')
                .map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-bold transition-all ${
                      isActive(`/category/${cat.slug}`)
                        ? 'bg-purple-50 text-purple-600 font-extrabold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}

              {/* Accessories Accordion on Mobile */}
              <div className="border-b border-slate-100 pb-1">
                <button
                  onClick={() => setMobileAccessoriesOpen(!mobileAccessoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  <span>Accessories</span>
                  <i
                    className={`fa-solid fa-chevron-down text-[10px] transition-transform ${
                      mobileAccessoriesOpen ? 'rotate-180 text-purple-600' : ''
                    }`}
                  />
                </button>

                {mobileAccessoriesOpen && (
                  <div className="pl-4 space-y-2 mt-1 bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                    <Link
                      href="/accessories"
                      onClick={() => setMenuOpen(false)}
                      className="block px-3 py-2 text-xs font-extrabold text-purple-600 hover:bg-purple-50 rounded-lg"
                    >
                      View All Accessories →
                    </Link>

                    {accessoriesTree.map((group) => {
                      const isOpen = !!mobileGroupsOpen[group.id];
                      const displayName = group.name.toLowerCase().includes('accessories') || group.name.toLowerCase().includes('accessory')
                        ? group.name
                        : `${group.name} Accessories`;
                      return (
                        <div key={group.id} className="space-y-1">
                          <Link
                            href={`/accessories/${group.slug}`}
                            onClick={() => setMenuOpen(false)}
                            className="w-full flex items-center px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg capitalize"
                          >
                            {displayName}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                <div className="flex flex-col gap-2 pt-2">
                  <Button variant="outline" className="w-full" href="/login" onClick={() => setMenuOpen(false)}>
                    Login
                  </Button>
                  <Button variant="primary" className="w-full bg-purple-600 hover:bg-purple-500 focus:ring-purple-500" href="/register" onClick={() => setMenuOpen(false)}>
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
