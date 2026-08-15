import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    '/api/**/*': [
      'src/lib/mysql_sync.js',
      'src/lib/mysql_write.js',
      'src/lib/db.json'
    ]
  }
};

export default nextConfig;
