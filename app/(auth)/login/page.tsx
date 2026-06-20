'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClientBrowser } from '@/lib/supabase-client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientBrowser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-[100vh] flex items-center justify-center bg-background-secondary"
    >
      {/* Blurred movie collage background (placeholder) */}
      <div className="absolute inset-0 bg-[url('https://via.placeholder.com/1920x1080')] bg-cover bg-center blur-3xl"></div>
      
      <div className="relative z-10 glass-card w-full max-w-md p-8 mx-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center font-outfit text-2xl md:text-3xl mb-6"
        >
          Welcome Back
        </motion.h1>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 p-3 bg-accent-coral/10 text-accent-coral rounded-lg"
          >
            {error}
          </motion.div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all pl-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-accent-blue/50 hover:text-accent-blue transition-colors"
                onClick={() => {}}
                aria-label="Toggle password visibility"
              >
                {/* Eye icon placeholder */}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 12s4-8 11-8 11 8-4 8-11 8-11-8zm5-4a1 1 0 100 2 1 1 0 000-2zm5 0a1 1 0 100 2 1 1 0 000-2zM12 11a2 2 0 100 4 2 2 0 000-4zm0 2a5 5 0 01-5 5 5 5 0 01-5-5h2a3 3 0 003 3h2a3 3 0 003-3h2a5 5 0 01-5-5z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Link
              href="#"
              className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-accent-blue text-white font-medium rounded-lg transition-all disabled:opacity-50 hover:bg-accent-blue/90"
          >
            {loading ? 'Signing In...' : 'Log In'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-secondary">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-accent-blue font-medium hover:text-accent-blue/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-8">
          <button
            className="w-full flex items-center justify-center px-6 py-3 bg-background-tertiary border border-accent-blue/20 text-accent-blue font-medium rounded-lg transition-all hover:bg-accent-blue/10"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </motion.div>
  );
}