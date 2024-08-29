/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // book covers (cover_image_url) have many different hostnames
        hostname: '*'
      }
    ]
  },

  // add additional logging to understand which requests are cached or uncached
  logging: {
    fetches: {
      fullUrl: true
    }
  }
};

export default nextConfig;
