'use client';

import { useCart } from '@/context/CartContext';

const WHATSAPP_NUMBER = '971506767915'; // Al Nader Pet Shop

/**
 * Builds a WhatsApp wa.me URL with a context-aware pre-filled message.
 *
 * - Empty cart  → generic greeting
 * - 1 cart item → "I'm interested in [Item Name] and would like to know more information"
 * - 2+ items    → bulleted list of all cart items with the same expression of interest
 */
export function buildWhatsAppUrl(cartItems: { name: string; quantity: number }[]): string {
  let message: string;

  if (cartItems.length === 0) {
    message =
      "Hi Al Nader Pet Shop! 🐾 I'd like to know more about your pets and accessories. Can you help me?";
  } else if (cartItems.length === 1) {
    const item = cartItems[0];
    const qty = item.quantity > 1 ? ` (x${item.quantity})` : '';
    message =
      `Hi Al Nader Pet Shop! 🐾 I'm interested in *${item.name}${qty}* and would like to know more information — availability, details, and pricing. Can you help me?`;
  } else {
    const itemList = cartItems
      .map((i) => `• ${i.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`)
      .join('\n');
    message =
      `Hi Al Nader Pet Shop! 🐾 I'm interested in the following items and would like to know more information:\n\n${itemList}\n\nCould you please share availability and details? Thank you!`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Floating WhatsApp button — shown site-wide, cart-aware pre-filled message. */
export default function WhatsAppFloat() {
  const { items } = useCart();
  const hasItems = items.length > 0;
  const url = buildWhatsAppUrl(items);

  const label = hasItems
    ? `Ask about your cart item${items.length > 1 ? 's' : ''} (${items.length})`
    : 'Chat with us on WhatsApp';

  return (
    <a
      id="whatsapp-floating-btn"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="whatsapp-float-btn"
    >
      {/* Icon */}
      <i className="fa-brands fa-whatsapp text-[28px] relative z-10" aria-hidden="true" />

      {/* Tooltip */}
      <span className="whatsapp-float-label" aria-hidden="true">
        {label}
      </span>

      {/* Pulse ring */}
      <span className="whatsapp-pulse" aria-hidden="true" />
    </a>
  );
}
