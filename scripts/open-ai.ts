import { timeOut } from "@/utils/time-out";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config as envConfig } from "dotenv";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

envConfig({ path: ["./.env", "./.env.local"] });

const openai = new OpenAI({
	apiKey: process.env.GPT_KEY,
	baseURL: process.env.GPT_URL,
});

const gemini_AI = new GoogleGenerativeAI(process.env.GEMINI_KEY || "");

export const isOpenAi = () => !process.env.AI || process.env.AI === "openai";
export const isGemini = () => process.env.AI === "gemini";

async function fetchChatCompletion(messages: ChatCompletionMessageParam[]) {
	if (isOpenAi()) {
		const result = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		console.log(`[AI][OpenAI]: use ${result.usage?.total_tokens} tokens.`);
		return result.choices[0].message.content || "";
	}

	if (isGemini()) {
		const geminiModel = gemini_AI.getGenerativeModel({
			model: "gemini-1.5-pro",
		});
		const result = await geminiModel.generateContent(
			messages.map((message) => message.content as string),
		);
		console.log(
			`[AI][Gemini]: use ${result.response.usageMetadata?.totalTokenCount} tokens.`,
		);
		return result.response.text();
	}

	return "";
}

/** 控制一下执行速率, gemini AI 2rpm */
async function sequentialChatCompletion<T>(
	promises: (() => Promise<T>)[],
): Promise<T[]> {
	const results: T[] = [];
	for (const [key, promise, index = Number(key)] of Object.entries(promises)) {
		const result = await promise();
		results.push(result);
		isGemini() &&
			index % 2 &&
			index !== promises.length - 1 &&
			(await timeOut(60 * 1000));
	}
	return results;
}

export { fetchChatCompletion, sequentialChatCompletion };
