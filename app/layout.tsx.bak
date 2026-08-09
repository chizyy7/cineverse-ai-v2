import './globals.css';
import { Inter } from 'next/font/google';
import { Outfit } from 'next/font/google';
import AuthButton from '@/components/ui/AuthButton';
import { Navigation } from '@/components/ui/Navigation';
import { ChatPanel } from '@/components/features/AIAssistant/ChatPanel';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'CineVerse AI',
  description: 'Your Entertainment, Finally Understood.',
  // PWA Manifest
  manifest: '/manifest.json',
  // PWA Icons
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      url: '/icons/icon-192x192.png'
    },
    {
      rel: 'apple-touch-icon',
      type: 'image/png',
      url: '/icons/icon-512x512.png'
    }
  ],
  // PWA Theme Color
  themeColor: [
    {
      media: '(prefers-color-scheme: light)',
      color: '#ffffff'
    },
    {
      media: '(prefers-color-scheme: dark)',
      color: '#0f172a'
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.className} ${inter.className}`}>
      <body>
        <ToastProvider>
          <div className="flex items-center justify-between px-6 py-4 bg-background-secondary/50 backdrop-blur-sm">
            <div className="flex items-center space-x-6">
              <h1 className="font-outfit text-xl text-primary">CineVerse AI</h1>
              <Navigation />
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <AuthButton />
            </div>
          </div>
          <div className="px-6 pb-4">
            {children}
          </div>
          <ChatPanel />
        </ToastProvider>
      </body>
    </html>
  );
}