import { keystoneContext } from "@/../keystone/context";
import { allArticlesRevalidateKey } from "@/actions/user-dict-utils";
import { google } from "googleapis";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { buildContent } from "./template";

export const dynamic = "force-dynamic";

const youtube = google.youtube("v3");
const channelId = "UCkinYTS9IHqOEwR1Sze2JTw";
// Ensure you set this as an environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

function decodeHtmlEntities(text: string | null | undefined): string {
	if (!text) return "";
	return text
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">");
}

// When setting the title or description
export async function GET() {
	try {
		if (!YOUTUBE_API_KEY) {
			return NextResponse.json(
				{ error: "YouTube API key is missing" },
				{ status: 400 },
			);
		}

		// Calculate the timestamp for 24 hours ago
		const twentyFourHoursAgo = new Date(
			Date.now() - 24 * 60 * 60 * 1000,
		).toISOString();

		const response = await youtube.search.list({
			key: YOUTUBE_API_KEY,
			channelId, // SBS News YouTube Channel ID
			part: ["snippet"],
			type: ["video"],
			order: "viewCount",
			publishedAfter: twentyFourHoursAgo,
			maxResults: 5,
			videoDuration: "short",
		});

		const videos = await Promise.all(
			(response.data.items || []).map(async (item) => {
				const videoId = item.id?.videoId;

				if (!videoId) return null;

				// Fetch detailed video statistics
				const statsResponse = await youtube.videos.list({
					key: YOUTUBE_API_KEY,
					part: ["snippet", "statistics"],
					id: [videoId],
				});

				const videoStats = statsResponse.data.items?.[0]?.statistics;
				const fullSnippet = statsResponse.data.items?.[0]?.snippet;

				return {
					videoId,
					title: decodeHtmlEntities(item.snippet?.title),
					description: decodeHtmlEntities(
						fullSnippet?.description || item.snippet?.description,
					),
					publishedAt: item.snippet?.publishedAt,
					viewCount: Number(videoStats?.viewCount || 0),
					thumbnailUrl: item.snippet?.thumbnails?.high?.url,
					liveBroadcastContent: fullSnippet?.liveBroadcastContent,
				};
			}),
		);

		// Filter out null results and sort by view count
		const mostViewedVideo = videos.filter(
			(video) => video?.liveBroadcastContent !== "live",
		)[0];

		if (!mostViewedVideo) {
			throw new Error("No mostViewedVideo video found");
		}

		await keystoneContext.db.Article.createOne({
			data: {
				title: mostViewedVideo.title,
				type: "TEXT",
				description: `SBS News [Read more](https://www.youtube.com/watch?v=${mostViewedVideo.videoId})`,
				poster: mostViewedVideo.thumbnailUrl,
				content: buildContent(mostViewedVideo),
			},
		});

		const count = await keystoneContext.db.Article.count({
			where: {},
		});

		console.log(`[SBS News][count]: ${count}`);

		// 暂时跳过
		// biome-ignore lint/correctness/noConstantCondition: <explanation>
		if (count > 100 && false) {
			const oldestTextArticle = (
				await keystoneContext.db.Article.findMany({
					where: {
						type: { equals: "TEXT" },
					},
					orderBy: {
						createdAt: "asc",
					},
					take: 1,
				})
			)[0];

			if (oldestTextArticle) {
				await keystoneContext.db.Article.deleteOne({
					where: {
						id: oldestTextArticle.id,
					},
				});
				console.log(`[SBS News][Deleted]: ${oldestTextArticle.title}`);
			}
		}

		revalidateTag(allArticlesRevalidateKey);

		return NextResponse.json({ status: 200 });
	} catch (error) {
		console.error("Error fetching YouTube videos:", error);
		return NextResponse.json(
			{ error: "Failed to fetch videos" },
			{ status: 500 },
		);
	}
}
