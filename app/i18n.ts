import { getRequestConfig } from "next-intl/server";
import {} from "next/headers";
import { DEFAULT_SITE_LANGUAGE } from "./utils/config";

export default getRequestConfig(async (params) => {
	// read from `cookies()`, `headers()`, etc.
	// TODO: GET COOKIE FOR LANGUAGE
	const locale = DEFAULT_SITE_LANGUAGE;

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});
