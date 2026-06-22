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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Please confirm your email address before logging in. Check your inbox.');
        }
        throw new Error(error.message);
      }

      const res = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user!.id,
          email: data.user!.email!,
          username: data.user!.user_metadata?.username || data.user!.email!.split('@')[0],
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        if (body.error !== 'User already exists') {
          console.error('Failed to ensure user profile:', body.error);
        }
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'https://cineversal-app.vercel.app/auth/callback' },
      });
      if (error) throw new Error(error.message);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
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
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-accent-blue/20" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-background-secondary text-text-tertiary">or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          type="button"
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-background-tertiary border border-accent-blue/20 text-primary font-medium rounded-lg transition-all hover:bg-accent-blue/10"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>
      </div>
    </motion.div>
  );
}