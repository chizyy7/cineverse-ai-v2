'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Discover' },
  { href: '/watchlist', label: 'Watchlist' },
];

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 100); // Simulate loading for SPA navigation
    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return (
    <nav className="hidden md:flex items-center gap-1">
      {isLoading && (
        <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      )}
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