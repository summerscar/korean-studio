import type { Lists } from ".keystone/types";

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
	local = "_local",
}

export const dictNameList = Object.values(Dicts);

export const DEFAULT_DICT = Dicts.popular;

export type UserDicts = Array<
	Lists.Dict.Item & { list: Lists.DictItem.Item[] }
>;

export type Dict = DictItem[];
