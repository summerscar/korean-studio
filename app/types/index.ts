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

export const THEME_DARK_KEY = "theme-dark";

export enum Themes {
	Light = "nord",
	Dark = "dark",
}

export type LevelParams = {
	level: Levels;
};

export type DocsTitleParams = {
	title: string;
};
