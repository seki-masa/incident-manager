/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js の HMR・React DevTools には unsafe-eval/unsafe-inline が必要
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Leaflet などインラインスタイル使用
              "style-src 'self' 'unsafe-inline'",
              // OpenStreetMap タイル画像
              "img-src 'self' data: blob: https://*.tile.openstreetmap.org",
              // Nominatim API
              "connect-src 'self' https://nominatim.openstreetmap.org",
              "font-src 'self' data:",
              "frame-src 'none'",
              "object-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
