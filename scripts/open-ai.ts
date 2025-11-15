import { timeOut } from "@/utils/time-out";
import { GoogleGenerativeAI, type Tool } from "@google/generative-ai";
import { config as envConfig } from "dotenv";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

envConfig({ path: ["./.env", "./.env.local"] });

const openai = new OpenAI({
	apiKey: process.env.GPT_KEY,
	baseURL: process.env.GPT_URL,
});

// Store multiple Gemini API keys
const GEMINI_KEYS = (process.env.GEMINI_KEY || "").split(",");
console.log(`[AI][Gemini]: Using ${GEMINI_KEYS.length} keys`);
let currentKeyIndex = 0;
let geminiInstance: GoogleGenerativeAI | null = null;

// Get or create Gemini instance with current key
function getGeminiInstance() {
	if (!geminiInstance || currentKeyIndex >= GEMINI_KEYS.length) {
		currentKeyIndex = 0;
	}
	if (!geminiInstance) {
		geminiInstance = new GoogleGenerativeAI(GEMINI_KEYS[currentKeyIndex]);
	}
	return geminiInstance;
}

// Switch to next key
function rotateGeminiKey() {
	currentKeyIndex++;
	geminiInstance = null; // Force recreation with new key
	return getGeminiInstance();
}

export const isOpenAi = () => !process.env.AI || process.env.AI === "openai";
export const isGemini = () => process.env.AI === "gemini";
export const currentModel = () =>
	process.env.GPT_MODEL ||
	(isOpenAi() ? "gpt-3.5-turbo" : isGemini() ? "gemini-1.5-flash" : "");

async function fetchChatCompletion(
	messages: ChatCompletionMessageParam[],
	search = false,
) {
	const model = currentModel();
	console.log(`[AI][${process.env.AI}]: ${model}`)
	if (isOpenAi()) {
		// TODO:  response_format
		// https://cookbook.openai.com/examples/structured_outputs_intro
		const result = await openai.chat.completions.create({
			model,
			messages,
		});
		console.log(
			`[AI][OpenAI][${model}]: use ${result.usage?.total_tokens} tokens.`,
		);
		return result.choices[0].message.content || "";
	}

	if (isGemini()) {
		let retryCount = 0;
		const maxRetries = GEMINI_KEYS.length;

		while (retryCount < maxRetries) {
			try {
				const geminiAI = getGeminiInstance();
				const tools: Tool[] = [];
				// @ts-ignore
				search && tools.push({ googleSearch: {} });
				const geminiModel = geminiAI.getGenerativeModel({
					model,
					// @ts-ignore
					tools,
				});
				const result = await geminiModel.generateContent(
					messages.map((message) => message.content as string),
				);
				console.log(
					`[AI][Gemini][${model}]: use ${result.response.usageMetadata?.totalTokenCount} tokens. Tools: ${JSON.stringify(
						tools,
					)}`,
				);
				return result.response.text();
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				if (
					error?.message?.includes("quota") ||
					error?.message?.includes("rate limit")
				) {
					console.warn(
						`Gemini API key ${currentKeyIndex + 1} quota exceeded, trying next key...`,
					);
					rotateGeminiKey();
					retryCount++;
					continue;
				}
				throw error; // Re-throw if it's not a quota error
			}
		}
		throw new Error("All Gemini API keys have exceeded their quota");
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
		console.log(
			`[sequentialChatCompletion][progress]: ${index + 1}/${promises.length}.......`,
		);
		isGemini() &&
			index % 2 &&
			index !== promises.length - 1 &&
			(await timeOut((currentModel() === "gemini-1.5-pro" ? 60 : 8) * 1000));
	}
	return results;
}

export { fetchChatCompletion, sequentialChatCompletion };
