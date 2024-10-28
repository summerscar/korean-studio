export interface Tran {
	en: string[];
	"zh-CN": string[];
	"zh-TW": string[];
	ja: string[];
}

export interface DictItem {
	name: string;
	trans: Tran;
	example?: string;
	exTrans?: Tran;
}

export enum Dicts {
	popular = "popular",
	dirty = "dirty",
	adverb = "adverb",
	family = "family",
	onomatopoeia = "onomatopoeia",
	user = "_local",
}

export const dictList = Object.values(Dicts);

export const DEFAULT_DICT = Dicts.popular;

export type Dict = DictItem[];
