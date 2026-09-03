import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  className?: string;
  href?: string;
}

export default function Logo({ className, href = '/' }: LogoProps) {
  const filterClasses = className?.split(' ').filter(c => c.includes('brightness') || c.includes('invert') || c.includes('grayscale')).join(' ') || '';

  return (
    <Link href={href} className={cn('relative block w-36 h-10 group transition-transform duration-200 hover:scale-102 flex-shrink-0', className)}>
      <Image
        src="/images/alnader-logo-clean.jpg"
        alt="Al Nader Pets & Accessories"
        fill
        className={cn('object-contain object-left', filterClasses)}
        priority
        unoptimized
      />
    </Link>
  );
}
