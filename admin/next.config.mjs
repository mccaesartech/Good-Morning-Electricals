/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/admin',
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/index.html' }]
    };
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' }
    ]
  }
};

export default nextConfig;
