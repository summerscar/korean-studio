export interface Tran {
	en: string[];
	"zh-CN": string[];
	"zh-TW": string[];
	ja: string[];
}

export interface DictItem {
	name: string;
	trans: Tran;
	example: string;
	exTrans: Tran;
}

export enum Dicts {
	popular = "popular",
	dirty = "dirty",
}

export const DEFAULT_DICT = Dicts.popular;

export type Dict = DictItem[];
