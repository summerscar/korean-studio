import axios from "axios";
import * as cheerio from "cheerio";
import { Feed, type Item } from "feed";
import { NextResponse } from "next/server";

const FEED_WEB_URL = process.env.XLYS_URL || "https://www.xlys02.com/s/hanju";
const SIZE = 10;

const GET = async () => {
	// Create the feed
	const feed = new Feed({
		title: "修罗影视 | 最新韩剧",
		description: "修罗影视 | 最新韩剧",
		id: FEED_WEB_URL,
		link: FEED_WEB_URL,
		language: "zh-CN",
		copyright: "All rights reserved",
	});

	const res = await axios.get(FEED_WEB_URL);
	const $ = cheerio.load(res.data);

	const elements = $(".row-cards>div").toArray().slice(0, SIZE);

	const result = await Promise.all(
		elements.map(async (element) => {
			const title = $(element).find(".card-body h3.card-title").text();
			const updateTime = $(element).find(".card-body p.text-muted").text();
			const badge = $(element).find("span.badge").text();
			const score = $(element).find("strong.ribbon").text() || "暂无评分";

			const href = $(element).find("div.card-link a").attr("href");
			const link = href
				? new URL(FEED_WEB_URL).origin + href.split(";")[0]
				: "";
			const image = $(element).find("img").attr("src");

			const res = await axios.get(link);

			const $Item = cheerio.load(res.data);
			$Item("input").remove();
			$Item("span.text-warning").remove();
			$Item("#copy-downloads").remove();

			const infoSection = $Item(
				"body > div.container-xl.clear-padding-sm.my-3.py-1 > div:nth-child(1) > div > div.row.mt-3 > div.col.mb-2",
			).prop("outerHTML");

			const playSection = $Item(
				"body > div.container-xl.clear-padding-sm.my-3.py-1 > div:nth-child(4)",
			).prop("outerHTML");
			const downloadSection = $Item(
				"body > div.container-xl.clear-padding-sm.my-3.py-1 > div.card.mt-3.download-wrapper",
			).prop("outerHTML");
			const torrentSection = $Item("#torrent-list").prop("outerHTML");

			return {
				title: `${title}-${badge}`,
				link,
				description: `${title}-${badge}-${score}`,
				content: `<img src="${image}" alt="${title}"/><br/>${infoSection}${playSection}${downloadSection}${torrentSection}`,
				date: new Date(updateTime),
				image: image,
			} as Item;
		}),
	);

	for (const item of result) {
		feed.addItem(item);
	}

	const responseStringArray = feed.rss2().split("\n");
	// responseStringArray.splice(
	// 	1,
	// 	0,
	// 	`<?xml-stylesheet href="/static/pretty-feed-v3.xsl" type="text/xsl"?>`,
	// );
	const responseString = responseStringArray.join("\n");

	// feed.
	// Return the feed as XML with explicit encoding
	return new NextResponse(responseString, {
		headers: {
			"Content-Type": "application/xml; charset=utf-8",
		},
	});
};

export { GET };
