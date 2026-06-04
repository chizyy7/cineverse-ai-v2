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
};

module.exports = nextConfig;