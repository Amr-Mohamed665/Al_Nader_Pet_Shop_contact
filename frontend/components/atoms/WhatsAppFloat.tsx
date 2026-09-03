'use client';

export default function WhatsAppFloat() {
  const WHATSAPP_NUMBER = '971506767915';

  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe5a] text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 hover:scale-110 animate-bounce-slow"
    >
      <i className="fa-brands fa-whatsapp text-[28px]"></i>
    </a>
  );
}
