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
	Light = "nord",
	Dark = "dark",
}

export type DocPathParams = {
	doc_path: string[];
};
