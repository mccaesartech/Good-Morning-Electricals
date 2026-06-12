/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};

export default nextConfig;
