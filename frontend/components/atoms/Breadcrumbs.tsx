import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items = [] }: BreadcrumbsProps) {
  return (
    <nav className="flex text-xs font-semibold text-slate-400 bg-white border border-slate-200/80 rounded-2xl px-4 py-2.5 w-fit shadow-sm" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1.5 md:space-x-2">
        <li className="inline-flex items-center">
          <Link href="/" className="hover:text-purple-600 flex items-center gap-1 transition-colors">
            <i className="fa-solid fa-house text-[10px]" /> Home
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center space-x-1.5 md:space-x-2">
            <i className="fa-solid fa-chevron-right text-[8px] text-slate-300" />
            {item.href ? (
              <Link href={item.href} className="hover:text-purple-600 transition-colors capitalize">
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-600 font-extrabold capitalize">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
