"use server";
import type { DictItem } from "@/types/dict";
import { isDev, isProd } from "@/utils/is-dev";
import { WORD_EXAMPLE } from "@/utils/local-dict";
import {
	fetchChatCompletion,
	sequentialChatCompletion,
} from "../../scripts/open-ai";

const promptTemplate = (word: string) => {
	return `
参考该 JSON 信息:
${JSON.stringify(WORD_EXAMPLE)}
进行一下操作:
[1] 现有单词【${word}】，若单词不是韩文请先根据该单词转换成韩文，去掉所有标点。
[2] 如果该韩文单词没有对应的汉字词 或 不是汉字 或 该汉字词不常见，则跳过操作[3],进行操作[4]。
[3] 如果该韩文单词有对应的汉字词，则把汉字词（使用【】包裹）也作为单词释义并放在各中语言的单词释义的第一位,如”단풍“的汉字词为”丹楓“则【丹楓】也作为单词释义之一放在首位。
[4] 以该韩语单词作为 JSON 中的 name 字段，trans为单词释义、example为单词例句(可以使用活用后的单词)、exTrans为例句释义，生成 JSON 字符串，其他字段也应补充完整，仅返回对应的 JSON 字符串不要添加任何其他内容。`;
};

export const generateWordAction = async (word: string) => {
	const prompt = promptTemplate(word);
	isDev &&
		console.log(
			"---------- start -----------\n[generateWordAction][prompt]:",
			prompt,
		);
	const result = await fetchChatCompletion([
		{
			role: "user",
			content: prompt,
		},
	]);
	isDev &&
		console.log(
			"[generateWordAction][result]:",
			result,
			"\n---------- end -----------",
		);
	return result?.match(/([\[\{][\s\S]*[\}\]])/)?.[1];
};

export const generateWordsAction = async (words: string[]) => {
	return (
		await sequentialChatCompletion(
			words
				.map((w) => w.trim())
				.map((w) => async () => {
					try {
						const res = JSON.parse(
							(await generateWordAction(w)) || "{}",
						) as DictItem;
						isProd && console.log("[generateWordsAction][wordGenerated]:", w);
						return res;
					} catch (e) {
						console.error(`[generateWordsAction][error]: ${e}`);
						return null;
					}
				}),
		)
	).filter((w) => w !== null);
};
