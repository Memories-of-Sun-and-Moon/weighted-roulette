import path from "path"
import type { NextConfig } from "next"

const isProd = process.env.NODE_ENV === "production"
const repo = "weighted-roulette"

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repo}` : "",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
}

export default nextConfig
