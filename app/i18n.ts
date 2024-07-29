import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { DEFAULT_SITE_LANGUAGE, LOCAL_KEY } from "./utils/config";

export default getRequestConfig(async () => {
	// read from `cookies()`, `headers()`, etc.
	// TODO: GET COOKIE FOR LANGUAGE
	const cookie = cookies();
	const locale = cookie.get(LOCAL_KEY)?.value || DEFAULT_SITE_LANGUAGE;

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});
