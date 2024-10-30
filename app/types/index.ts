import type { Lists } from ".keystone/types";

export type InputKeys = Record<string, boolean>;

export enum Levels {
	Beginner = "beginner",
	Intermediate = "intermediate",
}

export enum TopikLevels {
	TOPIK_I = "TOPIK I",
	TOPIK_II = "TOPIK II",
}

export type QuestionOptions = {
	content: string;
	isCorrect?: boolean;
}[];

export type TopikQuestion = Omit<Lists.Topik.Item, "options"> & {
	options: QuestionOptions;
};

export const THEME_KEY = "theme";

export enum Themes {
	Light = "emerald",
	Dark = "dark",
}

export type DocPathParams = {
	doc_path: string[];
};

export type HomeSetting = {
	/** 切换单词时是否自动发音 */
	autoVoice: boolean;
	/** 显示释义 */
	showMeaning: boolean;
	/** 启用音效 */
	enableAudio: boolean;
};
