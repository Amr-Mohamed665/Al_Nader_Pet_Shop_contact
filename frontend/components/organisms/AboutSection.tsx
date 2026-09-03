import Image from 'next/image';
import Link from 'next/link';

export default function AboutSection() {
  return (
    <section id="about" className="mb-14">
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Text Content */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-14 order-2 lg:order-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-[#7C4DDB] uppercase tracking-widest mb-3 bg-[#7C4DDB]/10 px-3 py-1 rounded-full self-start">
              🐾 ABOUT AL NADER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
              Your Trusted Pet Shop in the <span className="text-[#7C4DDB]">UAE</span>
            </h2>
            
            <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed mb-8 font-medium">
              <p>
                At <span className="font-extrabold text-slate-900">Al Nader Pets & Accessories Trading L.L.C</span>, we offer a wide range of healthy pets and premium accessories to keep them happy.
              </p>
              <p>
                Our passion is pets, and our promise is quality, care, and trust.
              </p>
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 self-start px-7 py-3.5 bg-gradient-to-br from-[#7C4DDB] to-[#581C87] hover:opacity-95 text-white text-xs sm:text-sm font-extrabold uppercase tracking-wider rounded-2xl transition-all duration-300 shadow-[0_4px_20px_rgba(124,77,219,0.4)] hover:shadow-[0_0_30px_rgba(124,77,219,0.6)] hover:-translate-y-1"
            >
              Learn More About Us 🐾
            </Link>
          </div>

          {/* Image */}
          <div className="relative min-h-[300px] lg:min-h-0 order-1 lg:order-2 bg-white">
            <Image
              src="/images/alnader-logo.jpg"
              alt="Al Nader Pets & Accessories Trading L.L.C. logo and puppies"
              fill
              className="object-contain p-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
