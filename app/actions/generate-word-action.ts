"use server";
import type { DictItem } from "@/types/dict";
import { isDev } from "@/utils/is-dev";
import { generateWordPrompt } from "@/utils/prompts";
import {
	fetchChatCompletion,
	sequentialChatCompletion,
} from "../../scripts/open-ai";

export const generateWordAction = async (word: string) => {
	const prompt = generateWordPrompt(word);
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
	const task = (w: string) => async () => {
		try {
			console.log("[generateWordsAction][wordGenerating]:", w);
			const res = JSON.parse((await generateWordAction(w)) || "{}") as DictItem;
			return res;
		} catch (e) {
			console.error(`[generateWordsAction][error]: ${e}`);
			throw e;
		}
	};
	return (
		await sequentialChatCompletion(words.map((w) => w.trim()).map(task))
	).filter((w) => w !== null);
};

export const generateWordSuggestionAction = async (prompt: string) => {
	isDev && console.log("[generateWordSuggestionAction][start]: ..........");
	const result = await fetchChatCompletion([
		{
			role: "user",
			content: prompt,
		},
	]);
	isDev &&
		console.log(
			"[generateWordSuggestionAction][result]:",
			result,
			"\n---------- end -----------",
		);
	return result;
};
