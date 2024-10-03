//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next')

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  env: {
    ROUTE_PREFIX_V3: '/v3',
    CLIENT_CDN_ENDPOINT: process.env.CLIENT_CDN_ENDPOINT,
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'pattern.localhost:8080',
        '*.staging.amplifi.io',
        '*.amplifi.io',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.*.pattern.com',
        port: '',
      },
    ],
    domains: ['cdn.*.pattern.com'],
  },
  // rewriting the path to the toggle-api to avoid CORS issues in order to fetch data from the API
  rewrites: async () => {
    return [
      {
        source: '/toggle/:path*',
        destination: 'https://toggle-api.usepredict.com/:path*',
      },
    ]
  },
}

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
]

module.exports = composePlugins(...plugins)(nextConfig)
