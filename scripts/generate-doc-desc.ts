import { readFileSync, writeFileSync } from "node:fs";
import { _listAllDocs as _listAllDocsByLevel } from "@/utils/list-docs";
import { flattenAllDocs, insertOrUpdateFrontmatterKey } from "./list-all-docs";
import { fetchChatCompletion, sequentialChatCompletion } from "./open-ai";

(async () => {
	const DESC_MIN_LENGTH = 10;

	const docs = await flattenAllDocs();
	// 筛序出文档中的 frontmatter 的 description 部分少于 DESC_MIN_LENGTH 个字的
	const docsNeedToGenerateDescription = docs.filter((doc) => {
		const docString = readFileSync(doc.path, "utf-8");
		doc.content = docString;
		const description = docString.match(/description:(.*)/)?.[1];
		return description !== undefined && description.length < DESC_MIN_LENGTH;
	});

	console.log("[generate-doc-desc]: start...");
	console.log(
		docsNeedToGenerateDescription.map((doc) => `[${doc.title}]...`).join("\n"),
	);
	console.log("[generate-doc-desc][find]: ↑↑↑↑↑↑↑↑↑↑↑↑");
	await sequentialChatCompletion(
		docsNeedToGenerateDescription.map((doc) => async () => {
			if (doc.content === undefined) return;

			console.log("[generate-doc-desc][title][", doc.title, "]: generate...");
			const description = (
				await fetchChatCompletion([
					{
						role: "user",
						content:
							"我将发你一份韩语学习相关教程，你将总结这份教程，生成的描述，控制在20-100个字。",
					},
					{
						role: "user",
						content: doc.content,
					},
				])
			)
				.trim()
				.replace(/\n/g, "")
				.replace(/[:：－〜]/g, " ");

			if (!description) return;
			console.log(
				`[generate-doc-desc][title][${doc.title}][update]: ${description}`,
			);
			// 将 description 写入 frontmatter
			const newDocString = insertOrUpdateFrontmatterKey(
				doc.content,
				"description",
				description,
			);
			writeFileSync(doc.path, newDocString, "utf-8");
			console.log("[generate-doc-desc][title][", doc.title, "]: success!");
		}),
	);
	console.log("[generate-doc-desc][all]: success!");
})();
