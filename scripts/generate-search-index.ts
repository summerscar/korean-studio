import { readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { cwd } from "node:process";
import { flattenAllDocs } from "./list-all-docs";

// 遍历文档目录，提取内容生成索引
(async function generateIndex() {
	const files = await flattenAllDocs();
	const searchData = [];
	console.log(
		"---------- start -----------\n[generate-search-index]: Generating search index...",
	);
	for (const file of files) {
		const content = await readFileSync(file.path, "utf-8");
		const resolvedContent = content
			.replace(/^---([\s\S]*?)---/g, "")
			.replace(/^[\n]?/g, " ");
		// 将数据添加到 searchData 数组，用于保存到 JSON 文件
		searchData.push({
			id: file.title,
			url: `/learn/${relative(join(cwd(), "mdx"), file.path).replace(/\.mdx?/, "")}`,
			title: file.title,
			level: file.level,
			relativeReadablePath: file.relativeReadablePath,
			content: resolvedContent,
		});
	}

	// 将索引保存为 JSON 文件
	writeFileSync(
		join(process.cwd(), "public", "search-index.json"),
		JSON.stringify(searchData),
	);
	console.log(
		"[generate-search-index]: Search index generated successfully!\n---------- end -----------",
	);
})();
