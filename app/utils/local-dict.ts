import type { DictItem } from "@/types/dict";
import { downloadFile } from "./download-file";
import { importJSONFile } from "./import-json-file";
const LOCAL_DICT_KEY = "localDict";

const WORD_EXAMPLE = {
	name: "하늘",
	trans: {
		en: ["Sky", "Heaven", "God"],
		"zh-CN": ["天空", "天堂", "上帝"],
		"zh-TW": ["天空", "天堂", "上帝"],
		ja: ["空", "天", "上帝"],
	},
	example: "하늘을 바라보세요.",
	exTrans: {
		en: ["Look at the sky."],
		"zh-CN": ["仰望天空。"],
		"zh-TW": ["仰望天空。"],
		ja: ["空を見てください。"],
	},
};

const setLocalDict = (dictItem: DictItem[]) => {
	localStorage.setItem(LOCAL_DICT_KEY, JSON.stringify(dictItem));
};

const getLocalDict = (): DictItem[] => {
	const localDict = JSON.parse(localStorage.getItem(LOCAL_DICT_KEY) || "[]");
	if (!localDict.length) {
		initLocalDict();
		return JSON.parse(localStorage.getItem(LOCAL_DICT_KEY) || "[]");
	}
	return localDict;
};

const addLocalDict = (...dictItem: DictItem[]) => {
	console.log("[addLocalDict]", dictItem);
	const localDict = getLocalDict();
	const newDict = [
		...localDict.filter((item) => !dictItem.find((i) => i.name === item.name)),
		...dictItem,
	];
	setLocalDict(newDict);
};

const removeLocalDict = (dictName: string) => {
	console.log("[removeLocalDict]", dictName);
	const localDict = getLocalDict();
	const newDict = localDict.filter((item) => item.name !== dictName);
	setLocalDict(newDict);
};

const initLocalDict = () => {
	setLocalDict([]);
};

const downLoadLocalDict = () => {
	const localDict = getLocalDict();
	downloadFile(JSON.stringify(localDict, null, 2), `${LOCAL_DICT_KEY}.json`);
};

const importLocalDict = async (cb?: () => void) => {
	const fileString = await importJSONFile();
	const localDict = JSON.parse(fileString as string);
	setLocalDict(localDict);
	cb?.();
};

export {
	getLocalDict,
	initLocalDict,
	addLocalDict,
	removeLocalDict,
	importLocalDict,
	downLoadLocalDict,
	LOCAL_DICT_KEY,
	WORD_EXAMPLE,
};
