import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getUser, signOut } from '@/lib/auth';

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user data on mount
  // In a real app, you'd use useEffect or a data fetching library
  // For this example, we'll simulate it
  async function loadUser() {
    try {
      setLoading(true);
      const userData = await getUser();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Simulate componentDidMount
  // In a real component, this would be in useEffect
  // For simplicity, we'll call it directly and rely on React's rendering
  loadUser();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center space-x-2"
      >
        {/* Loading spinner */}
        <div className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full animate-spin"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {user ? (
        <div className="flex items-center space-x-3 relative">
          {/* User avatar */}
          <div className="relative w-8 h-8">
            <img 
              src={user.avatar_url || 'https://via.placeholder.com/80'} 
              alt="Avatar" 
              className="w-full h-full object-cover rounded-full ring-2 ring-accent-blue/20"
            />
            {/* Online indicator */}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent-success rounded-full border-2 border-background-primary"></div>
          </div>
          
          {/* Username */}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-primary">{user.user_metadata?.username || user.email?.split('@')[0] || 'User'}</p>
          </div>
          
          {/* Dropdown trigger */}
          <button
            onClick={() => {}}
            className="ml-2 p-1 text-accent-blue hover:text-accent-blue/80 transition-colors rounded-lg hover:bg-accent-blue/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Simple dropdown menu (in a real app, you'd use a proper dropdown component) */}
          <div className="absolute right-0 mt-2 w-48 bg-background-tertiary rounded-lg shadow-lg border border-accent-blue/20 z-20 hidden">
            {/* This would be shown/hidden based on state in a real implementation */}
            <div className="px-4 py-2">
              <button 
                onClick={handleSignOut}
                className="w-full text-left text-sm text-accent-coral hover:bg-accent-coral/10 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <Link href="/(auth)/login" className="flex items-center space-x-2 px-3 py-2 bg-accent-blue/10 text-accent-blue rounded-lg hover:bg-accent-blue/20 transition-colors">
            Log in
          </Link>
          <Link href="/(auth)/signup" className="ml-3 flex items-center space-x-2 px-3 py-2 bg-accent-blue text-white font-medium rounded-lg hover:bg-accent-blue/90 transition-colors">
            Sign Up
          </Link>
        </>
      )}
    </motion.div>
  );
}