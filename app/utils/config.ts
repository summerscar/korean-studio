import { SITES_LANGUAGE } from "@/types/site";

const siteLanguageConfig: Record<SITES_LANGUAGE, string> = {
	[SITES_LANGUAGE.korean]: "한국어",
	[SITES_LANGUAGE.japanese]: "日本語",
	[SITES_LANGUAGE.zhCN]: "中文简体",
	[SITES_LANGUAGE.zhTW]: "中文繁体",
	[SITES_LANGUAGE.english]: "English",
};

const DEFAULT_SITE_LANGUAGE = SITES_LANGUAGE.zhCN;

/**
 * @param site 本站学习语言
 * @param language UI 语言
 * @returns 本站配置
 */
const getSiteConfig = (language: SITES_LANGUAGE = DEFAULT_SITE_LANGUAGE) => {
	return {
		siteLanguage: siteLanguageConfig[language],
		supportedSiteLanguages: SITES_LANGUAGE,
	} as const;
};

const siteConfig = getSiteConfig();

export const dicts = {
	"kr-popular": "流行词汇",
};

export { siteConfig, DEFAULT_SITE_LANGUAGE };
