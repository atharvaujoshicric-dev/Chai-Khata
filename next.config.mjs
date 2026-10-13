// Static export so the app can be hosted on GitHub Pages (or any static host).
// The GitHub Actions workflow sets NEXT_PUBLIC_BASE_PATH to "/<repo-name>"
// for project sites. Locally it is empty, so `npm run dev` works at "/".
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
