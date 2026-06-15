'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { signUp } from '@/lib/actions/auth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (password !== passwordConfirm) {
        throw new Error('Passwords do not match');
      }

      await signUp({ email, username, password });
      setSuccess('Account created successfully! Redirecting...');
      // Wait a bit then redirect to onboarding
      setTimeout(() => {
        router.push('/onboarding');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
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
          Sign Up
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
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-4 p-3 bg-accent-success/10 text-accent-success rounded-lg"
          >
            {success}
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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              placeholder="Choose a username"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 bg-background-tertiary border border-accent-blue/20 rounded-lg text-primary focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {/* Password strength indicator */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary mb-1">
              Password Strength
            </label>
            <div className="w-full bg-background-tertiary rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  password.length === 0
                    ? 'bg-transparent'
                    : password.length < 4
                    ? 'bg-accent-coral'
                    : password.length < 8
                    ? 'bg-accent-blue'
                    : password.length < 12
                    ? 'bg-accent-gold'
                    : 'bg-accent-success'
                }` as string}
                style={{ width: Math.min(password.length * 8, 100) + '%' }}
              ></div>
            </div>
            <p className="text-xs text-secondary mt-1">
              {password.length === 0
                ? 'Enter a password to see strength'
                : password.length < 4
                ? 'Too weak'
                : password.length < 8
                ? 'Could be stronger'
                : password.length < 12
                ? 'Good'
                : 'Strong'}
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-accent-blue/50 rounded"
              />
              <span>I agree to the Terms of Service and Privacy Policy</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-accent-blue text-white font-medium rounded-lg transition-all disabled:opacity-50 hover:bg-accent-blue/90"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-secondary">
            Already have an account?{' '}
            <Link
              href="/(auth)/login"
              className="text-accent-blue font-medium hover:text-accent-blue/80 transition-colors"
            >
              Log in
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