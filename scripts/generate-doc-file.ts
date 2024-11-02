import { write, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Levels } from "@/types";
import { fetchChatCompletion, sequentialChatCompletion } from "./open-ai";

const frontmatterTemplate = (title: string) => `---
title: ${title}
author: summerscar
description:
date: ${new Date().toISOString()}
tags:
---\n`;

const promptTemplate = (title: string) => `
我要编写韩文语法的说明文档，现有语法 【${title}】,参照以下规则。
例句给出含义注释即可，不需要标出发音。
辅音、元音的说法请用子音、母音代替。
句型 部分的说明尽量简洁。
例子部分 给出的韩文句子请使用 <Speak></Speak> 标签包裹。
参考如下的 Markdown 格式文本，请以 Markdown 格式给出该韩文语法的说明文档。
# ${title}
## 句型
[根据所接续的不同词性，如何接续？如何活用？分别列出。]
## 含义
[该语法的含义，尽可能多的列出不同情况下的含义]
## 例子
[对应所列出的不同含义，分别给出3个例子，每个例子都有对应的注释]
## 注意
[该语法使用时的注意事项，与其他类似语法的区别，尽可能多的列出]
## 类似语法
[该语法与其他类似语法的区别，尽可能多的列出]
`;

const generateDoc = async (title: string) => {
	console.log(`[generate-doc-file][title]: 【${title}】 start...`);
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
			content: promptTemplate(title),
		},
	]);

	const content = `${frontmatterTemplate(title)}\n${gptContent}`;

	// console.log(`[generate-doc-file][content]: \n${content}`);
	writeFileSync(docPath, content);
	console.log(`[generate-doc-file][path]: ${docPath}`);
	console.log("[generate-doc-file]: done");
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
