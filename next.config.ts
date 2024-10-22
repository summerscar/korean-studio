import withMDX from "@next/mdx";
// import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./app/i18n.ts");

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	// without this, 'Error: Expected Upload to be a GraphQL nullable type.'
	serverExternalPackages: ["graphql"],
	experimental: {
		turbo: {
			rules: {
				"*.svg": {
					loaders: ["@svgr/webpack"],
					as: "*.js",
				},
			},
		},
	},
};

export default withNextIntl(withMDX()(nextConfig));
