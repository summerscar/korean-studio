import { write, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Levels } from "@/types";
import { generateDocPrompt } from "@/utils/prompts";
import { fetchChatCompletion, sequentialChatCompletion } from "./open-ai";

const frontmatterTemplate = (title: string) => `---
title: ${title}
author: summerscar
description:
date: ${new Date().toISOString()}
tags:
---\n`;

const generateDoc = async (title: string) => {
	console.log(
		`---------- start -----------\n[generate-doc-file][title]: 【${title}】 start...`,
	);
	const docPath = resolve(
		process.cwd(),
		"mdx",
		process.env.DOC_LEVEL || Levels.Beginner,
		"语法形态",
		`${title
			.normalize("NFC")
			// biome-ignore lint/suspicious/noMisleadingCharacterClass: <explanation>
			.replace(/[\u0300-\u036f]/g, "")
			.replace(/[:：－〜,/]/g, "-")
			.replace(/\(.*?\)/, "")
			.replace(/\s/g, "")
			.replace(/\?/g, "")
			.toLowerCase()}.md`,
	);

	const gptContent = await fetchChatCompletion([
		{
			role: "user",
			content: generateDocPrompt(title),
		},
	]);

	const content = `${frontmatterTemplate(title)}\n${gptContent}`;

	// console.log(`[generate-doc-file][content]: \n${content}`);
	writeFileSync(docPath, content);
	console.log(`[generate-doc-file][path]: ${docPath}`);
	console.log("[generate-doc-file]: done\n---------- end -----------");
};

export const generateDocs = async (docs: string[]) => {
	console.log("[generate-doc-file]: start...");
	console.log("[generate-doc-file][docs][all]: \n", docs.join("\n"));

	await sequentialChatCompletion(
		docs
			.map((item) => item.trim())
			.filter(Boolean)
			.map((title) => async () => {
				await generateDoc(title);
			}),
	);
	console.log("[generate-doc-file][all]: done");
};

(async () => {
	const docs = process.argv.slice(2);
	generateDocs(docs);
})();

// generateDocs([...new Set([])]);
