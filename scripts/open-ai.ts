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

async function fetchChatCompletion(messages: ChatCompletionMessageParam[]) {
	if (!process.env.AI || process.env.AI === "openai") {
		const result = await openai.chat.completions.create({
			model: "gpt-3.5-turbo",
			messages,
		});
		console.log(`[AI][OpenAI]: use ${result.usage?.total_tokens} tokens.`);
		return result.choices[0].message.content;
	}

	if (process.env.AI === "gemini") {
		const geminiModel = gemini_AI.getGenerativeModel({
			model: "gemini-1.5-pro",
		});
		const result = await geminiModel.generateContent(
			messages[0].content as string,
		);
		console.log(
			`[AI][Gemini]: use ${result.response.usageMetadata?.totalTokenCount} tokens.`,
		);
		return result.response.text();
	}
}

export { fetchChatCompletion };
