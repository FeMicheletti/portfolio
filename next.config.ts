import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	devIndicators: false,
	experimental: {
		serverActions: {
			bodySizeLimit: "21mb",
		},
	},
};

export default nextConfig;
