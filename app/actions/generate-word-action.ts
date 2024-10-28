"use server";
import { isDev } from "@/utils/is-dev";
import { WORD_EXAMPLE } from "@/utils/user-dict";
import { fetchChatCompletion } from "../../scripts/open-ai";

export const generateWordAction = async (word: string) => {
	const prompt = `参考该 JSON 信息
	${JSON.stringify(WORD_EXAMPLE)}
	请生成韩语单词【${word}】作为 JSON 中的 name 字段，单词不需要任何标点，其他字段也相应补充完整，仅返回对应的 JSON 字符串，不要添加任何其他内容。
	`;
	const result = (
		await fetchChatCompletion([
			{
				role: "user",
				content: prompt,
			},
		])
	)?.replace(/^```json\n(.*)\n```$/g, "$1");
	isDev && console.log("[generateWordAction][result]:", result);
	return result;
};
