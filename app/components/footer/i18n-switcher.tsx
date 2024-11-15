"use client";
import { getI18nFromCookie, setI18nToCookie } from "@/actions/check-i18n";
import { SITES_LANGUAGE } from "@/types/site";
import { DEFAULT_SITE_LANGUAGE } from "@/utils/config";
import { useMount } from "ahooks";
import clsx from "clsx";
import { useState } from "react";

const mapForLocale: Record<string, string> = {
	[SITES_LANGUAGE.zhCN]: "🇨🇳",
	[SITES_LANGUAGE.en]: "🇺🇸",
	[SITES_LANGUAGE.ja]: "🇯🇵",
};

const I18nSwitcher = ({ defaultLocale }: { defaultLocale: SITES_LANGUAGE }) => {
	const [locale, setLocale] = useState<string>(defaultLocale);

	useMount(async () => {
		const acceptLanguage = window.navigator.languages.find(
			(locale) => locale in mapForLocale,
		);
		const newLocale =
			(await getI18nFromCookie()) || acceptLanguage || DEFAULT_SITE_LANGUAGE;
		setLocale(newLocale);
		await setI18nToCookie(newLocale);
	});

	const handleChangeLocale = (newLocale: string) => async () => {
		if (newLocale === locale) return;
		setLocale(newLocale);
		await setI18nToCookie(newLocale);
	};

	return (
		<div className="dropdown dropdown-hover dropdown-top">
			<div
				tabIndex={0}
				/* biome-ignore lint/a11y/useSemanticElements: <explanation> */
				role="button"
				className="btn btn-ghost btn-xs text-lg leading-4"
			>
				{mapForLocale[locale]}
			</div>
			<ul
				/* biome-ignore lint/a11y/noNoninteractiveTabindex: <explanation> */
				tabIndex={0}
				className="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow"
			>
				{Object.keys(mapForLocale).map((key) => (
					<li key={key}>
						<a
							className={clsx({ active: key === locale })}
							// biome-ignore lint/a11y/useValidAnchor: <explanation>
							onClick={handleChangeLocale(key)}
						>
							{mapForLocale[key]}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
};
export { I18nSwitcher };
