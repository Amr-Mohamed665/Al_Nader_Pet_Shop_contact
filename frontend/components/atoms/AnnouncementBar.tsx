'use client';

export default function AnnouncementBar() {
  return (
    <div className="relative bg-[#2A1558] text-white text-xs py-2 px-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left Welcome message */}
        <div className="font-semibold text-center md:text-left tracking-wide">
          Welcome to Al Nader Pets & Accessories Trading L.L.C
        </div>

        {/* Center / Right features */}
        <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
          <span className="inline-flex items-center gap-1.5 text-purple-200">
            <i className="fa-solid fa-truck-fast text-purple-400" style={{ fontSize: '13px' }}></i>
            <span>Fast Delivery</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-purple-200">
            <i className="fa-solid fa-heart text-purple-400" style={{ fontSize: '13px' }}></i>
            <span>Trusted by Pet Lovers</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-purple-200">
            <i className="fa-solid fa-shield-halved text-purple-400" style={{ fontSize: '13px' }}></i>
            <span>Quality Guaranteed</span>
          </span>

          {/* Social Icons */}
          <div className="flex items-center gap-3 border-l border-purple-800 pl-4 ml-1">
            <a
              href="https://www.facebook.com/share/1EKVxKJ8c4/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="Facebook"
            >
              <i className="fa-brands fa-facebook-f text-[14px]"></i>
            </a>
            <a
              href="https://www.instagram.com/alnaderpets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <i className="fa-brands fa-instagram text-[14px]"></i>
            </a>
            <a
              href="https://youtube.com/@alnaderpetshop9989"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-white transition-colors"
              aria-label="YouTube"
            >
              <i className="fa-brands fa-youtube text-[14px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
