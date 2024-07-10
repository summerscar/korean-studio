import type { NamespaceKeys, NestedKeyOf } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";

const getServerI18n = async (
	namespace?: NamespaceKeys<IntlMessages, NestedKeyOf<IntlMessages>>,
) => {
	const locale = await getLocale();
	return await getTranslations({ locale, namespace });
};

export { getServerI18n };
