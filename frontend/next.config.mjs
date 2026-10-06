/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Let phones on the same Wi-Fi load dev assets (e.g. http://192.168.x.x:3000).
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*", "172.16.*.*", "172.17.*.*", "*.local", "*.trycloudflare.com"],
  images: { unoptimized: true },
  experimental: {
    // Session videos are uploaded through the /api proxy below; the default 10MB cap truncated
    // phone clips (e.g. cricket deliveries) and the backend never received the file.
    middlewareClientMaxBodySize: "500mb",
    // Analysis requests run the CV models synchronously and can take minutes on long clips.
    proxyTimeout: 10 * 60 * 1000,
  },
  async rewrites() {
    // Proxy API calls to the FastAPI backend so the browser stays same-origin.
    const api = process.env.API_URL || "http://localhost:8000";
    return [{ source: "/api/:path*", destination: `${api}/:path*` }];
  },
};

export default nextConfig;
