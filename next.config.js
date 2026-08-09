const withPWA = require('next-pwa');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.tmdb.org', // TMDB
      'i.scdn.co', // Spotify
      'crunchyroll.com', // Crunchyroll
      'via.placeholder.com', // Placeholder images
    ],
  },
  // Optional: Add other Next.js config here
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
})(nextConfig);