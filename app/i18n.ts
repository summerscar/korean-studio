import { getRequestConfig } from "next-intl/server";
import { getI18nFromCookie } from "./actions/check-i18n";
import { DEFAULT_SITE_LANGUAGE } from "./utils/config";

export default getRequestConfig(async () => {
	const locale = (await getI18nFromCookie()) || DEFAULT_SITE_LANGUAGE;

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});
