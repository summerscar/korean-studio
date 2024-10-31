"use server";
import { isDev } from "@/utils/is-dev";
import { WORD_EXAMPLE } from "@/utils/user-dict";
import { fetchChatCompletion } from "../../scripts/open-ai";

export const generateWordAction = async (word: string) => {
	const prompt = `参考该 JSON 信息
	${JSON.stringify(WORD_EXAMPLE)}
	现有单词【${word}】，若单词不是韩文请先根据该单词转换成韩文，单词不需要任何标点。如果该韩文单词有对应的汉字词，则把汉字词（使用【】包裹）也作为单词释义并放在各中语言的单词释义的第一位，如”공부“的汉字词为”工夫“则【工夫】也作为单词释义之一放在首位，
	然后以该韩语单词作为 JSON 中的 name 字段，trans为单词释义、example为单词例句(可以使用活用后的单词)、exTrans为例句释义，生成 JSON 字符串，其他字段也应补充完整，仅返回对应的 JSON 字符串不要添加任何其他内容。
	`;
	isDev && console.log("[generateWordAction][prompt]:", prompt);
	const result = await fetchChatCompletion([
		{
			role: "user",
			content: prompt,
		},
	]);
	isDev && console.log("[generateWordAction][result]:", result);
	return result?.match(/([\[\{][\s\S]*[\}\]])/)?.[1];
};
