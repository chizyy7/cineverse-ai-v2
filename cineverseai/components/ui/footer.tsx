import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 bg-background-secondary">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col md:flex-row md:justify-between items-center mb-8">
          {/* Logo */}
          <div className="mb-4 md:mb-0">
            <h2 className="font-outfit text-xl text-primary">
              CineVerse AI
            </h2>
            <p className="text-secondary mt-1">
              Your Entertainment, Finally Understood.
            </p>
          </div>
          
          {/* Links */}
          <div className="space-x-6">
            <Link href="#" className="text-secondary hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#" className="text-secondary hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="#" className="text-secondary hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#" className="text-secondary hover:text-primary transition-colors">
              About
            </Link>
          </div>
        </div>
        
        {/* Social Icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a href="#" className="text-secondary hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </a>
          <a href="#" className="text-secondary hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h3m-12 0h3m-3 0h3m-3 0V9m0 0h3m-3 0h3m-3 0V9m0 0h3m-3 0h3" />
            </svg>
          </a>
          <a href="#" className="text-secondary hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V10a2 2 0 00-2-2H6a2 2 0 00-2 2v3m0 0l-3 3m3-3l3 3M8 7h12a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
          </a>
          <a href="#" className="text-secondary hover:text-primary transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V3m0 0h8m-8 0v8m8 0h-8M3 12a9 9 0 1018 0 9 9 0 00-18 0z" />
            </svg>
          </a>
        </div>
        
        {/* Copyright */}
        <p className="text-tertiary text-sm">
          &copy; {new Date().getFullYear()} CineVerse AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}