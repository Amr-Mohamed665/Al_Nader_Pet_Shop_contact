import { cn } from '@/utils/cn';

interface AvatarProps {
  name?: string;
  className?: string;
}

export default function Avatar({ name = '', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-center justify-center h-9 w-9 rounded-full bg-teal-100 text-teal-800 border-2 border-white shadow-sm font-bold text-xs cursor-pointer select-none hover:bg-teal-200 transition-colors duration-150',
        className
      )}
    >
      {initials || '👤'}
    </div>
  );
}
