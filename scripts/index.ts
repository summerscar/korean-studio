const foo = "11";

console.log(foo);
import axios from "axios";
import * as cheerio from "cheerio";

async function scrapeKpedia() {
	try {
		const url = "https://m.kpedia.jp/p/302-2";
		const response = await axios.get(url);
		const $ = cheerio.load(response.data);

		const trArray = $(
			"body > div.container > table.school-course > tbody > tr",
		);
		trArray.map((_index, tr) => {
			const tdArray = $(tr).children("td");
			const title = $(tdArray[0]).text();
			const explanation = $(tdArray[1]).text();
			console.log(title, "----", explanation);
		});
		// 可以根据需要提取更多信息
	} catch (error) {
		console.error("爬取过程中出错:", error);
	}
}

scrapeKpedia();
