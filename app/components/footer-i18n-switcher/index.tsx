"use client";
import { DEFAULT_SITE_LANGUAGE, LOCAL_KEY } from "@/utils/config";
import { useMemoizedFn, useMount, useUpdateEffect } from "ahooks";
import clsx from "clsx";
import Cookies from "js-cookie";
import { useState } from "react";

const mapForLocale: Record<string, string> = {
	"zh-CN": "🇨🇳",
	en: "🇺🇸",
	ja: "🇯🇵",
};

const I18nSwitcher = () => {
	const [locale, setLocale] = useState<string>(DEFAULT_SITE_LANGUAGE);

	const setLanguageToStorage = useMemoizedFn((newLocale: string) => {
		// console.log("set language to storage: ", newLocale);
		localStorage.setItem(LOCAL_KEY, newLocale);
		Cookies.set(LOCAL_KEY, newLocale, { expires: 365 });
	});

	useMount(() => {
		const acceptLanguage =
			window.navigator.languages.find((locale) => locale in mapForLocale) ||
			DEFAULT_SITE_LANGUAGE;
		// TODO: 服务器默认英文，找到匹配语言后自动切换
		const newLocale = localStorage.getItem("locale") || acceptLanguage;
		setLocale(newLocale);
	});

	const handleChangeLocale = (newLocale: string) => () => {
		setLocale(newLocale);
		setTimeout(() => {
			window.location.reload();
		});
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
