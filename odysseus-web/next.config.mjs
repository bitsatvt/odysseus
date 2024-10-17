/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/vt",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
