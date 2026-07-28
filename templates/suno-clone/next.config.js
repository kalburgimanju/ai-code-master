/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This template lives inside a larger repo with other lockfiles; pin the
  // trace root so Next.js doesn't pick the wrong workspace directory.
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
