// Environment variable validation
// Validates all required environment variables on application startup

/**
 * Validates that all required environment variables are set
 * Throws an error with a clear message if any are missing
 */
export function validateEnvironment(): void {
  const requiredVars = [
    // Supabase (required for auth and database)
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',

    // OpenAI (required for AI features)
    'OPENAI_API_KEY',

    // TMDB (required for movie/TV data)
    'TMDB_API_KEY',

    // Spotify (required for music features)
    'SPOTIFY_CLIENT_ID',
    'SPOTIFY_CLIENT_SECRET',

    // Stripe (required for payments)
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',

    // Redis (for caching)
    'REDIS_URL',

    // Database (for Prisma)
    'DATABASE_URL',

    // NextAuth
    'NEXTAUTH_SECRET',

    // Next.js
    'NEXTAUTH_URL',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env.local file and ensure all required variables are set.\n' +
      'See .env.example for reference.'
    );
  }
}

/**
 * Gets an environment variable with a fallback for development
 * @param name The name of the environment variable
 * @param fallback Optional fallback value (only for non-production)
 */
export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];

  if (value !== undefined && value !== '') {
    return value;
  }

  if (fallback !== undefined && process.env.NODE_ENV !== 'production') {
    return fallback;
  }

  if (value === undefined) {
    throw new Error(`Environment variable ${name} is not set`);
  }

  return value; // This will be empty string, but we'll let the caller handle it
}
