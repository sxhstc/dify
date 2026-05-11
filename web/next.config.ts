import type { NextConfig } from '@/next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createMDX from '@next/mdx'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { env } from './env'

const isDev = process.env.NODE_ENV === 'development'
const enableCodeInspector = process.env.NEXT_ENABLE_CODE_INSPECTOR === 'true'
const configDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(configDir, '..')
const withMDX = createMDX()
const allowedDevOrigins = process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  basePath: env.NEXT_PUBLIC_BASE_PATH,
  ...(allowedDevOrigins?.length ? { allowedDevOrigins } : {}),
  transpilePackages: ['@t3-oss/env-core', '@t3-oss/env-nextjs', 'echarts', 'zrender'],
  turbopack: {
    // Keep Turbopack scoped to this workspace instead of traversing parent
    // folders that may contain unrelated lockfiles.
    root: workspaceRoot,
    // The code inspector helper can fail to bind its local port in dev and
    // block page rendering. Keep it opt-in for local development.
    ...(enableCodeInspector
      ? {
          rules: codeInspectorPlugin({
            bundler: 'turbopack',
          }),
        }
      : {}),
  },
  productionBrowserSourceMaps: false, // enable browser source map generation during the production build
  // Configure pageExtensions to include md and mdx
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  typescript: {
    // https://nextjs.org/docs/api-reference/next.config.js/ignoring-typescript-errors
    ignoreBuildErrors: true,
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/apps',
        permanent: false,
      },
    ]
  },
  output: 'standalone',
  compiler: {
    removeConsole: isDev ? false : { exclude: ['warn', 'error'] },
  },
}

export default withMDX(nextConfig)
