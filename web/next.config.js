/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@simulador/shared'],
  async rewrites() {
    const API = process.env.API_URL ?? 'http://localhost:4002'
    return [
      { source: '/api/:path*', destination: `${API}/api/:path*` },
    ]
  },
}
