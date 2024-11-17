import type { MetadataRoute } from "next";
import { flattenAllDocs } from "scripts/list-all-docs";
import { Levels } from "./types";
import { toolsNames } from "./types/tools";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	// 基础 URL
	const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

	// 基础路由
	const routes = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 1,
		},
		// Learn 相关路由
		...[Levels.Beginner, Levels.Intermediate].map((level) => ({
			url: `${baseUrl}/learn/${level}`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.9,
		})),
		...(await flattenAllDocs()).map((doc) => ({
			url: `${baseUrl}/learn/${doc.level}/${doc.relativeUrl}`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.8,
		})),
		{
			url: `${baseUrl}/learn`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.9,
		},
		// TOPIK 相关路由
		{
			url: `${baseUrl}/topik`,
			lastModified: new Date(),
			changeFrequency: "daily" as const,
			priority: 0.7,
		},
		...["TOPIK_I", "TOPIK_II"].map((level) => ({
			url: `${baseUrl}/topik/${level}`,
			lastModified: new Date(),
			changeFrequency: "yearly" as const,
			priority: 0.7,
		})),
		// Tools 相关路由
		{
			url: `${baseUrl}/tools`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		},
		...(toolsNames || []).map((tool) => ({
			url: `${baseUrl}/tools/${tool}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.8,
		})),
	];

	return routes;
}
