export type InputKeys = Record<string, boolean>;

export enum Levels {
	Beginner = "beginner",
	Intermediate = "intermediate",
}

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
