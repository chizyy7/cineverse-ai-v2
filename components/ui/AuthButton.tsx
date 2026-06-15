'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientBrowser } from '@/lib/supabase-client';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientBrowser();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {user ? (
        <div className="flex items-center space-x-3 relative">
          <div className="relative w-8 h-8">
            <img
              src={user.user_metadata?.avatar_url || 'https://via.placeholder.com/80'}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full ring-2 ring-accent-blue/20"
            />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent-success rounded-full border-2 border-background-primary"></div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-primary">{user.user_metadata?.username || user.email?.split('@')[0] || 'User'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="ml-2 p-1 text-accent-coral hover:text-accent-coral/80 transition-colors rounded-lg hover:bg-accent-coral/10"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link href="/(auth)/login" className="flex items-center space-x-2 px-3 py-2 bg-accent-blue/10 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors">
            Log in
          </Link>
          <Link href="/(auth)/signup" className="flex items-center space-x-2 px-3 py-2 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}