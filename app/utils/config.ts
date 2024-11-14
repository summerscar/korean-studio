import { SITES_LANGUAGE } from "@/types/site";

const LOCALE_KEY = "locale";
const DEFAULT_SITE_LANGUAGE = SITES_LANGUAGE.zhCN;

const DEFAULT_COOKIE_CONFIG = {
	maxAge: 365 * 24 * 60 * 60,
	path: "/",
};

const HOME_SETTING_KEY = "home_setting";

const FAV_LIST_KEY = "favList";

export {
	DEFAULT_SITE_LANGUAGE,
	LOCALE_KEY,
	DEFAULT_COOKIE_CONFIG,
	HOME_SETTING_KEY,
	FAV_LIST_KEY,
};
