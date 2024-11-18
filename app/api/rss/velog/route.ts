/** 放个私货，方面放独立项目管理 */
import { Feed } from "feed";
import { NextResponse } from "next/server";

interface VelogPost {
	id: string;
	title: string;
	short_description: string;
	thumbnail: string;
	likes: number;
	user: {
		username: string;
		profile: {
			display_name: string;
		};
	};
	url_slug: string;
	released_at: string;
	updated_at: string;
}

// "timeframe":"week" | "month"
const GET = async () => {
	const res = await fetch("https://v3.velog.io/graphql", {
		headers: {
			"content-type": "application/json",
			Referer: "https://velog.io/",
		},
		body: '{"query":"\\n    query trendingPosts($input: TrendingPostsInput!) {\\n  trendingPosts(input: $input) {\\n    id\\n    title\\n    short_description\\n    thumbnail\\n    likes\\n    user {\\n      id\\n      username\\n      profile {\\n        id\\n        thumbnail\\n        display_name\\n      }\\n    }\\n    url_slug\\n    released_at\\n    updated_at\\n    is_private\\n    comments_count\\n  }\\n}\\n    ","variables":{"input":{"limit":20,"offset":0,"timeframe":"week"}}}',
		method: "POST",
	});

	const data = await res.json();
	const posts = data.data.trendingPosts;

	// Create the feed
	const feed = new Feed({
		title: "Velog Trending Posts",
		description: "Latest trending posts from Velog",
		id: "https://velog.io",
		link: "https://velog.io",
		language: "ko",
		favicon: "https://velog.io/favicon.ico",
		copyright: "All rights reserved",
	});

	// Add items to feed
	posts.forEach((post: VelogPost) => {
		// Sanitize text content
		const sanitizedTitle = post.title?.replace(
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/g,
			"",
		);
		const sanitizedDesc = post.short_description?.replace(
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/g,
			"",
		);
		const sanitizedAuthor = post.user.profile.display_name?.replace(
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uFFFE-\uFFFF]/g,
			"",
		);

		feed.addItem({
			title: sanitizedTitle || "",
			id: post.id,
			link: `https://velog.io/@${post.user.username}/${post.url_slug}`,
			description: sanitizedDesc || "",
			author: [
				{
					name: sanitizedAuthor || "",
				},
			],
			date: new Date(post.released_at),
			image: post.thumbnail,
		});
	});

	// Return the feed as XML with explicit encoding
	return new NextResponse(feed.rss2(), {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};

export { GET };
