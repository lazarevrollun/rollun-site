import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // AD-12: single process serves site + /admin + local API.
  // Standalone output produces a thin Node runtime image for Docker.
  output: 'standalone',
  // Next 16 Cache Components (formerly PPR / dynamicIO surface).
  cacheComponents: true,
  images: {
    // Emit webp from /_next/image (Media owns the source format too).
    formats: ['image/webp'],
    // Canonical widths — single source of truth, mirrored from Media.upload.imageSizes.
    // Next requires every imageSizes value to be < the smallest deviceSize.
    deviceSizes: [640, 1024, 1600, 2400],
    imageSizes: [256],
    // Allow optimizing the same-origin path Payload serves uploads at
    // (`/api/media/file/<filename>`), and nothing else.
    localPatterns: [{ pathname: '/api/media/**' }],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
