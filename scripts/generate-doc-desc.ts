import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
	type FileItem,
	_listAllDocs as _listAllDocsByLevel,
} from "@/utils/list-docs";
import { config as envConfig } from "dotenv";
import OpenAI from "openai";
envConfig({ path: ["./.env", "./.env.local"] });

(async () => {
	const DESC_MIN_LENGTH = 10;
	const levels = ["beginner", "intermediate"];
	const docs = (
		await Promise.all(levels.map((level) => listAllDocsByLevel(level)))
	).flat();
	// console.log("[generate-doc-desc]: \n", docs);
	// 筛序出文档中的 frontmatter 的 description 部分少于 DESC_MIN_LENGTH 个字的
	const docsNeedToGenerateDescription = docs.filter((doc) => {
		const docString = readFileSync(doc.path, "utf-8");
		doc.content = docString;
		const description = docString.match(/description: (.*)/)?.[1];
		return description && description.length < DESC_MIN_LENGTH;
	});

	console.log(
		"[generate-doc-desc]: start...\n",
		docsNeedToGenerateDescription.map((doc) => `【${doc.title}】`).join("\n"),
		"\namount: ",
		docsNeedToGenerateDescription.length,
	);
	await Promise.all(
		docsNeedToGenerateDescription.map(async (doc) => {
			const description = await fetchChatCompletion(doc.content);
			if (!description) return;
			console.log("[generate-doc-desc][title][", doc.title, "]: ", description);
			// 将 description 写入 frontmatter
			const newDocString = doc.content.replace(
				/description: (.*)/,
				`description: ${description}`,
			);
			writeFileSync(doc.path, newDocString, "utf-8");
			console.log("[generate-doc-desc][title][", doc.title, "]: success!");
		}),
	);
	console.log("[generate-doc-desc][all]: success!");
})();

async function listAllDocsByLevel(level: string) {
	const docs = await _listAllDocsByLevel(level);
	const flattenDocs = docs
		.flatMap((doc) => {
			if ("children" in doc) {
				return doc.children;
			}
			return doc;
		})
		.map((doc) => {
			return {
				title: doc.title,
				path: join(process.cwd(), "mdx", level, (doc as FileItem).relativePath),
				content: "",
			};
		});
	return flattenDocs;
}

const openai = new OpenAI({
	apiKey: process.env.GPT_KEY,
	baseURL: process.env.GPT_URL,
});

async function fetchChatCompletion(docContent: string) {
	const result = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [
			{
				role: "user",
				content:
					"我将发你一份韩语学习相关教程，你将总结这份教程，生成的描述，控制在20-100个字。",
			},
			{
				role: "user",
				content: docContent,
			},
		],
	});
	console.log(`[chatGPT]: use ${result.usage?.total_tokens} tokens.`);
	return result.choices[0].message.content;
}
