/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/assets/:path*.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Nama file unggahan memakai UUID, sehingga aman di-cache sangat lama.
        source: '/uploads/hero/:path*.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
};

export default nextConfig;
