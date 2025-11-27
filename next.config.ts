/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**", // allow all paths
      },
      {
        protocol: "https",
        hostname: "lakshaydesign.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
      // add more remote patterns here if needed
    ],
  },
};

module.exports = nextConfig;
