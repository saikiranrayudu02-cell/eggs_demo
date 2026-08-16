import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': [
      'src/lib/dist/mysql_sync/index.js',
      'src/lib/dist/mysql_write/index.js',
      'src/lib/db.json'
    ]
  }
};

export default nextConfig;
