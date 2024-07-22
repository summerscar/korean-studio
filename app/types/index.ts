export type InputKeys = Record<string, boolean>;

export enum Levels {
	Beginner = "beginner",
	Intermediate = "intermediate",
}

export type LevelParams = {
	level: Levels;
};
