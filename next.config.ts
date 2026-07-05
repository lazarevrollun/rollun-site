import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // AD-12: single process serves site + /admin + local API.
  // Standalone output produces a thin Node runtime image for Docker.
  output: 'standalone',
  // Next 16 Cache Components (formerly PPR / dynamicIO surface).
  cacheComponents: true,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
