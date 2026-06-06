/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.tmdb.org',
      'i.scdn.co',
      'crunchyroll.com',
      'via.placeholder.com',
    ],
  },
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
};

module.exports = nextConfig;
