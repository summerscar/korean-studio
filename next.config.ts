import withMDX from "@next/mdx";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./app/i18n.ts");

const SVGRConfig = {
	svgoConfig: {
		plugins: [
			{
				name: "preset-default",
				params: {
					overrides: {
						cleanupIds: false,
					},
				},
			},
		],
	},
};

const nextConfig: NextConfig = {
	pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
	// without this, 'Error: Expected Upload to be a GraphQL nullable type.'
	serverExternalPackages: ["graphql"],
	experimental: {
		staleTimes: {
			// default: 0
			dynamic: 60 * 0.5,
			// default: 5min
			static: 60 * 5,
		},
		turbo: {
			rules: {
				"*.svg": {
					loaders: [
						{
							loader: "@svgr/webpack",
							options: SVGRConfig,
						},
					],
					as: "*.js",
				},
			},
		},
	},
	webpack(config, { isServer }) {
		if (isServer) {
			config.plugins = [...config.plugins, new PrismaPlugin()];
		}

		// Grab the existing rule that handles SVG imports
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const fileLoaderRule = config.module.rules.find((rule: any) =>
			rule.test?.test?.(".svg"),
		);

		config.module.rules.push(
			// Reapply the existing rule, but only for svg imports ending in ?url
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			// Convert all other *.svg imports to React components
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
				use: [
					{
						loader: "@svgr/webpack",
						options: SVGRConfig,
					},
				],
			},
		);

		// Modify the file loader rule to ignore *.svg, since we have it handled now.
		fileLoaderRule.exclude = /\.svg$/i;

		config.module.rules.push({
			test: /\.(mp3)$/,
			type: "asset/resource",
			generator: {
				filename: "static/[name].[hash].[ext]",
			},
		});

		return config;
	},
};

export default withNextIntl(withMDX()(nextConfig));
