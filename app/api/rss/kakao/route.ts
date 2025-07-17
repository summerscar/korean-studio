import { Feed } from "feed";
import { NextResponse } from "next/server";

interface Category {
	code: string;
	name: string;
}

interface Author {
	name: string;
	description: string;
	profile: string;
}

interface Content {
	id: number;
	title: string;
	releaseDate: string;
	releaseDateTime: string;
	categories: Category[];
	authors: Author[];
	thumbnailUri: string;
}

interface Page {
	contents: Content[];
	pageNumber: number;
}

interface KakaoResponse {
	pages: Page[];
}

interface PostDetail {
	content: string;
}

function sanitizeContent(content: string): string {
	return (
		content
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]/g, "") // Remove invalid XML characters
			.replace(/&(?!(amp|lt|gt|quot|apos);)/g, "&amp;") // Encode unescaped ampersands
			// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
			.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
	); // Remove control characters
}

async function fetchPostDetail(postId: number): Promise<PostDetail | null> {
	try {
		const response = await fetch(
			`https://tech.kakao.com/api/v1/posts/${postId}`,
			{
				cache: "force-cache",
				headers: {
					accept: "*/*",
					"accept-language":
						"zh-CN,zh;q=0.9,ja-JP;q=0.8,ja;q=0.7,ko-KR;q=0.6,ko;q=0.5,en;q=0.4",
					Referer: "https://tech.kakao.com/blog",
				},
			},
		);
		const data = await response.json();
		return {
			content: sanitizeContent(data.content),
		};
	} catch (error) {
		console.error(`Error fetching post ${postId}:`, error);
		return null;
	}
}

export async function GET() {
	try {
		const response = await fetch(
			"https://tech.kakao.com/api/v1/posts/no-offset?categoryCode=blog&lastSeq=0&firstSeq=0&lastPageNumber=0&firstPageNumber=0&blockDirection=NEXT",
			{
				headers: {
					accept: "*/*",
					"accept-language":
						"zh-CN,zh;q=0.9,ja-JP;q=0.8,ja;q=0.7,ko-KR;q=0.6,ko;q=0.5,en;q=0.4",
					"sec-ch-ua":
						'"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"macOS"',
					Referer: "https://tech.kakao.com/blog",
				},
			},
		);

		const data: KakaoResponse = await response.json();

		const feed = new Feed({
			title: "Kakao Tech Blog",
			description: "카카오 기술 블로그 RSS 피드",
			id: "https://tech.kakao.com/blog",
			link: "https://tech.kakao.com/blog",
			language: "ko",
			favicon: "https://tech.kakao.com/favicon.ico",
			copyright: "All rights reserved 2024, Kakao Corp.",
		});

		// Process all contents from all pages
		for (const page of data.pages.slice(0, 1)) {
			for (const content of page.contents) {
				const postDetail = await fetchPostDetail(content.id);
				const description = postDetail
					? `<div>
							<img src="${content.thumbnailUri}" alt="${sanitizeContent(content.title)}" style="max-width: 100%; height: auto;"/>
							<div style="margin-top: 20px;">
								${postDetail.content}
							</div>
						</div>`
					: content.thumbnailUri;

				feed.addItem({
					title: sanitizeContent(content.title),
					id: content.id.toString(),
					link: `https://tech.kakao.com/blog/${content.id}`,
					description: description,
					author: [{ name: sanitizeContent(content.authors[0].name) }],
					date: new Date(content.releaseDateTime),
					category: content.categories.map((cat) => ({
						name: sanitizeContent(cat.name),
					})),
				});
			}
		}

		return new NextResponse(feed.rss2(), {
			headers: {
				"Content-Type": "application/xml; charset=utf-8",
			},
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);
		return new NextResponse("Error generating RSS feed", { status: 500 });
	}
}
