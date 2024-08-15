"use server";
import { LOCAL_KEY } from "@/utils/config";
import { cookies } from "next/headers";

const getI18nFromCookie = async () => {
	const cookie = cookies();
	const locale = cookie.get(LOCAL_KEY)?.value;
	return locale;
};

const setI18nToCookie = async (locale: string) => {
	const cookie = cookies();
	await cookie.set(LOCAL_KEY, locale, {
		maxAge: 365 * 24 * 60 * 60,
		path: "/",
	});
};

export { getI18nFromCookie, setI18nToCookie };
