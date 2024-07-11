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

export type Dict = DictItem[];
