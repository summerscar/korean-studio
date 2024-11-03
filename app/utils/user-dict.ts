import type { DictItem } from "@/types/dict";
const USER_DICT_KEY = "userDict";

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

const setUserDict = (dictItem: DictItem[]) => {
	localStorage.setItem(USER_DICT_KEY, JSON.stringify(dictItem));
};

const getUserDict = (): DictItem[] => {
	const userDict = JSON.parse(localStorage.getItem(USER_DICT_KEY) || "[]");
	if (!userDict.length) {
		initUserDict();
		return JSON.parse(localStorage.getItem(USER_DICT_KEY) || "[]");
	}
	return userDict;
};

const addUserDict = (...dictItem: DictItem[]) => {
	console.log("[addUserDict]", dictItem);
	const userDict = getUserDict();
	const newDict = [
		...userDict.filter((item) => !dictItem.find((i) => i.name === item.name)),
		...dictItem,
	];
	setUserDict(newDict);
};

const removeUserDict = (dictName: string) => {
	console.log("[removeUserDict]", dictName);
	const userDict = getUserDict();
	const newDict = userDict.filter((item) => item.name !== dictName);
	setUserDict(newDict);
};

const initUserDict = () => {
	setUserDict([WORD_EXAMPLE]);
};

const downLoadDict = () => {
	const userDict = getUserDict();
	const blob = new Blob([JSON.stringify(userDict, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${USER_DICT_KEY}.json`;
	link.click();
	URL.revokeObjectURL(url);
};

const importDict = (cb?: () => void) => {
	const file = document.createElement("input");
	file.type = "file";
	file.accept = "application/json";
	file.click();
	file.onchange = (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const userDict = JSON.parse(reader.result as string);
			setUserDict(userDict);
			cb?.();
		};
		reader.readAsText(file);
	};
};

export {
	getUserDict,
	initUserDict,
	addUserDict,
	removeUserDict,
	importDict,
	downLoadDict,
	USER_DICT_KEY,
	WORD_EXAMPLE,
};
