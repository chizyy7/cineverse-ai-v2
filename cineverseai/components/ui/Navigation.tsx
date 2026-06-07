'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Discover' },
  { href: '/watchlist', label: 'Watchlist' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent-blue/20 text-accent-blue'
                : 'text-text-secondary hover:text-primary hover:bg-background-tertiary'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
