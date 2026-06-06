import './globals.css';
import { Inter } from 'next/font/google';
import { Outfit } from 'next/font/google';
import AuthButton from '@/components/ui/AuthButton';
import { ChatPanel } from '@/components/features/AIAssistant/ChatPanel';

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
      <body>
        <div className="flex items-center justify-between px-6 py-4 bg-background-secondary/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <h1 className="font-outfit text-xl text-primary">CineVerse AI</h1>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <AuthButton />
          </div>
        </div>
        <div className="px-6 pb-4">
          {children}
        </div>
        <ChatPanel />
      </body>
    </html>
  );
}