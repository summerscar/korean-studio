"use server";
import { THEME_KEY, type Themes } from "@/types";
import { DEFAULT_COOKIE_CONFIG } from "@/utils/config";
import { cookies } from "next/headers";

const getThemeFromCookie = async () => {
	const cookie = cookies();
	const theme = cookie.get(THEME_KEY)?.value;
	return theme as Themes | undefined;
};

const setThemeToCookie = async (theme: string) => {
	const cookie = cookies();
	await cookie.set(THEME_KEY, theme, DEFAULT_COOKIE_CONFIG);
};

export { getThemeFromCookie, setThemeToCookie };
