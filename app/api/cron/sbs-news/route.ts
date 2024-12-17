import { keystoneContext } from "@/../keystone/context";
import { allArticlesRevalidateKey } from "@/actions/user-dict-utils";
import { google } from "googleapis";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { buildContent } from "./template";

const youtube = google.youtube("v3");
const channelId = "UCkinYTS9IHqOEwR1Sze2JTw";
// Ensure you set this as an environment variable
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

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
			maxResults: 1,
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
				console.log("item.snippet?.thumbnails", item.snippet?.thumbnails);
				return {
					videoId,
					title: item.snippet?.title,
					description: fullSnippet?.description || item.snippet?.description,
					publishedAt: item.snippet?.publishedAt,
					viewCount: Number(videoStats?.viewCount || 0),
					thumbnailUrl: item.snippet?.thumbnails?.high?.url,
				};
			}),
		);
		// Filter out null results and sort by view count
		const mostViewedVideo = videos[0];
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
