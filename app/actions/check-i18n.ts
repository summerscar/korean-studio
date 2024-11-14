"use server";
import type { SITES_LANGUAGE } from "@/types/site";
import { LOCALE_KEY } from "@/utils/config";
import { cookies } from "next/headers";

const getI18nFromCookie = async () => {
	const cookie = await cookies();
	const locale = cookie.get(LOCALE_KEY)?.value;
	return locale as SITES_LANGUAGE | undefined;
};

const setI18nToCookie = async (locale: string) => {
	const cookie = await cookies();
	await cookie.set(LOCALE_KEY, locale, {
		maxAge: 365 * 24 * 60 * 60,
		path: "/",
	});
};

export { getI18nFromCookie, setI18nToCookie };
