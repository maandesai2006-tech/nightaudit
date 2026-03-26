import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/nightaudit',
  images: { unoptimized: true },
}

export default nextConfig
