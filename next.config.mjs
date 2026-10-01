/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/API/:path*',
        destination: 'http://localhost:3000/API/:path*',
      },
      {
        source: '/admin/assets/:path*',
        destination: 'http://localhost:3000/admin/assets/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
