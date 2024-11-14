import { getRequestConfig } from "next-intl/server";
import { headers } from "next/headers";
import { getI18nFromCookie } from "./actions/check-i18n";
import { SITES_LANGUAGE } from "./types/site";
import { DEFAULT_SITE_LANGUAGE } from "./utils/config";

export default getRequestConfig(async () => {
	const locale =
		(await getI18nFromCookie()) ||
		(await getLanguageFromHeader()) ||
		DEFAULT_SITE_LANGUAGE;

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});

const getLanguageFromHeader = async () => {
	const header = await headers();
	const acceptLanguage = header.get("accept-language") || "";
	const languages = acceptLanguage
		.split(",")
		.map((lang) => {
			const [code, qValue] = lang.split(";q=");
			return { code: code.trim(), priority: Number.parseFloat(qValue) || 1.0 };
		})
		.sort((a, b) => b.priority - a.priority);

	// 查找第一个受支持的语言
	for (const lang of languages) {
		if (Object.values(SITES_LANGUAGE).includes(lang.code as SITES_LANGUAGE)) {
			return lang.code;
		}
	}
	return;
};
