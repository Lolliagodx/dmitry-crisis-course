import type { NextConfig } from 'next';
const nextConfig: NextConfig = { output: 'export', basePath: process.env.GITHUB_PAGES === 'true' ? '/dmitry-crisis-course' : '' };
export default nextConfig;
