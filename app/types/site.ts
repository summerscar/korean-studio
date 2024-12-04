enum SITES_LANGUAGE {
	ja = "ja",
	zhCN = "zh-CN",
	// zhTW = "zh-TW",
	en = "en",
}

const SITES_LANGUAGE_NAME: Record<SITES_LANGUAGE, string> = {
	[SITES_LANGUAGE.ja]: "日文",
	[SITES_LANGUAGE.zhCN]: "简体中文",
	// [SITES_LANGUAGE.zhTW]: "繁体中文",
	[SITES_LANGUAGE.en]: "英文",
};

export { SITES_LANGUAGE, SITES_LANGUAGE_NAME };
