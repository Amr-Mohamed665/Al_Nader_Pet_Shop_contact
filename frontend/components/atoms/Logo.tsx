import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  href?: string;
  showSlogan?: boolean;
  sloganText?: string;
  sloganClassName?: string;
}

export default function Logo({
  className,
  href = '/',
  showSlogan = false,
  sloganText = 'Where Pets Become Family',
  sloganClassName,
}: LogoProps) {
  const filterClasses = className?.split(' ').filter(c => c.includes('brightness') || c.includes('invert') || c.includes('grayscale')).join(' ') || '';

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col justify-center transition-transform duration-200 hover:scale-102 flex-shrink-0 select-none relative',
        className
      )}
    >
      <div className="relative w-36 h-9">
        <Image
          src="/images/alnader-logo-clean.jpg"
          alt="Al Nader Pets & Accessories"
          fill
          className={cn('object-contain object-left', filterClasses)}
          priority
          unoptimized
        />
      </div>

      {showSlogan && (
        <span
          className={cn(
            'text-sm sm:text-base font-medium text-purple-700 tracking-wide leading-tight mt-1 whitespace-nowrap group-hover:text-purple-600 transition-colors text-center',
            sloganClassName
          )}
          style={{ fontFamily: 'var(--font-satisfy), var(--font-great-vibes), cursive' }}
        >
          {sloganText}
        </span>
      )}
    </Link>
  );
}
