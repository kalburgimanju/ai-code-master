/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i0.wp.com",
      },
      {
        protocol: "https",
        hostname: "edwarddonner.com",
      },
      {
        protocol: "https",
        hostname: "*.wp.com",
      },
    ],
  },
};

module.exports = nextConfig;
