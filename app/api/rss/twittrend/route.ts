import axios from "axios";
import * as cheerio from "cheerio";
import { Feed } from "feed";
import { marked } from "marked";
import { NextResponse } from "next/server";
import { fetchChatCompletion } from "scripts/open-ai";

export async function GET() {
	try {
		// 创建 RSS feed
		const feed = new Feed({
			title: "Twitter Trend 🇯🇵/🇰🇷",
			description: "Twitter trending topics in Japan/Korea",
			id: "https://twittrend.jp/",
			link: "https://twittrend.jp/",
			language: "ja",
			updated: new Date(),
			copyright: "All rights reserved 2024",
		});

		// 获取网页内容
		const resJP = await axios.get("https://twittrend.jp/");
		const $JP = cheerio.load(resJP.data);

		const resKR = await axios.get("https://twittrend.net/");
		const $KR = cheerio.load(resKR.data);

		const process = async (
			el: ReturnType<typeof $JP>,
			$: cheerio.CheerioAPI,
		) => {
			el.find("script").remove();
			el.find(".box-header span").remove();
			el.find('[id^="more"]').remove();
			el.find("a").each((_, element) => {
				$(element).before(`<span class="title">${$(element).text()}</span>`);
				$(element).text(" ↗️ ");
			});
			const trends = el
				.find("li .trend span.title")
				.slice(0, 5)
				.toArray()
				.map((cur) => {
					return $(cur).text();
				});

			const res = await fetchChatCompletion([
				{
					role: "user",
					content: `为下面的推特热搜词条生成总结,,这些词条间没有关系: ${trends.join(
						", ",
					)}.请使用 ${"zh-CN"} 语言。`,
				},
			]);

			el.find(".box-body").prepend(`<div class="summary">${marked(res)}</div>`);
		};

		const trendsNowJP = $JP("#now");
		await process(trendsNowJP, $JP);

		const trendsNowKR = $KR("#now");
		await process(trendsNowKR, $KR);

		const desc = `<div style="display: flex; flex-direction: row; justify-content: space-between;">
		<div><a href="https://twittrend.jp/">Home page 🇯🇵</a>${trendsNowJP.html()}</div><div><a href="https://twittrend.net/">Home page 🇰🇷</a>${trendsNowKR.html()}</div>
		</div>`;
		const time = new Date().toLocaleString("zh-CN", {
			timeZone: "Asia/Shanghai",
		});

		// 添加趋势内容到 RSS feed
		feed.addItem({
			title: `Tweet trend ${time}`,
			id: `twittrend-${time}`,
			link: "https://twittrend.jp/",
			description: desc || "",
			date: new Date(),
		});

		// 设置响应头并返回 RSS XML
		return new NextResponse(feed.rss2(), {
			headers: {
				"Content-Type": "application/xml",
				"Cache-Control": "public, max-age=3600",
			},
		});
	} catch (error) {
		console.error("Error generating RSS feed:", error);
		return new NextResponse("Error generating RSS feed", { status: 500 });
	}
}
