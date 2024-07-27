"use client";
import { DEFAULT_SITE_LANGUAGE } from "@/utils/config";
import { useMemoizedFn, useMount, useUpdate, useUpdateEffect } from "ahooks";
import clsx from "clsx";
import { useEffect, useState } from "react";

const mapForLocale: Record<string, string> = {
	"zh-CN": "🇨🇳",
	en: "🇺🇸",
	ja: "🇯🇵",
};
// TODO： i18n
const I18nSwitcher = () => {
	const [locale, setLocale] = useState<string>(DEFAULT_SITE_LANGUAGE);

	const setLanguageToStorage = useMemoizedFn((newLocale: string) => {
		console.log("set language to storage: ", newLocale);
		localStorage.setItem("locale", newLocale);
	});

	useMount(() => {
		const newLocale =
			localStorage.getItem("locale") || window.navigator.language;
		setLocale(newLocale);
	});

	const handleChangeLocale = (newLocale: string) => () => {
		setLocale(newLocale);
	};

	useUpdateEffect(() => {
		if (!locale) return;
		setLanguageToStorage(locale);
	}, [locale, setLanguageToStorage]);

	return (
		<div className="dropdown dropdown-hover dropdown-top">
			<div role="button" className="btn btn-ghost btn-xs text-lg leading-4">
				{mapForLocale[locale]}
			</div>
			<ul className="dropdown-content menu bg-base-100 rounded-box z-[1] p-2 shadow">
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
