import type { DictItem } from "@/types/dict";
const USER_DICT_KEY = "userDict";

const WORD_EXAMPLE = {
	name: "나의 단어",
	trans: {
		en: ["My word"],
		"zh-CN": ["我的单词"],
		"zh-TW": ["我的單字"],
		ja: ["私の単語"],
	},
	example: "나의 단어를 만듭니다.",
	exTrans: {
		en: ["Create my word."],
		"zh-CN": ["创建我的单词。"],
		"zh-TW": ["建立我的單字。"],
		ja: ["私の単語を作成します。"],
	},
};

const getUserDict = (): DictItem[] => {
	const userDict = JSON.parse(localStorage.getItem(USER_DICT_KEY) || "[]");
	if (!userDict.length) {
		initUserDict();
		return JSON.parse(localStorage.getItem(USER_DICT_KEY) || "[]");
	}
	return userDict;
};

const addUserDict = (dictItem: DictItem) => {
	console.log("[addUserDict]", dictItem);
	const userDict = getUserDict();
	const newDict = [
		...userDict.filter((item) => item.name !== dictItem.name),
		dictItem,
	];
	localStorage.setItem(USER_DICT_KEY, JSON.stringify(newDict));
};

const removeUserDict = (dictName: string) => {
	const userDict = getUserDict();
	const newDict = userDict.filter((item) => item.name !== dictName);
	localStorage.setItem(USER_DICT_KEY, JSON.stringify(newDict));
};

const initUserDict = () => {
	localStorage.setItem(USER_DICT_KEY, JSON.stringify([WORD_EXAMPLE]));
};

export {
	getUserDict,
	initUserDict,
	addUserDict,
	removeUserDict,
	USER_DICT_KEY,
	WORD_EXAMPLE,
};
