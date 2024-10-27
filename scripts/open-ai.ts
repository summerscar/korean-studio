import { config as envConfig } from "dotenv";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
envConfig({ path: ["./.env", "./.env.local"] });

const openai = new OpenAI({
	apiKey: process.env.GPT_KEY,
	baseURL: process.env.GPT_URL,
});

async function fetchChatCompletion(messages: ChatCompletionMessageParam[]) {
	const result = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages,
	});
	console.log(`[chatGPT]: use ${result.usage?.total_tokens} tokens.`);
	return result.choices[0].message.content;
}

export { fetchChatCompletion };
