/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // book covers (cover_image_url) have many different hostnames
        hostname: '*'
      }
    ]
  }
};

export default nextConfig;
