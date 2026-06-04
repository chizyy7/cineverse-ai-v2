import './globals.css';
import { Inter } from 'next/font/google';
import { Outfit } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'CineVerse AI',
  description: 'Your Entertainment, Finally Understood.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.className} ${inter.className}`}>
      <body>{children}</body>
    </html>
  );
}