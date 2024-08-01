"use client";
import { Dicts } from "@/types/dict";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

const DictMenu = () => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const tIndex = useTranslations("Home");
	const currentDict = searchParams.get("dict") || Dicts.popular;

	const handleClick = (dict: Dicts) => () => {
		router.push(`/?dict=${dict}`);
	};
	return (
		<ul className="menu menu-horizontal menu-sm bg-base-200 rounded-box mb-3 shadow-md">
			{Object.entries(Dicts).map(([key, value]) => (
				<li key={key}>
					<span
						className={value === currentDict ? "active" : ""}
						onClick={handleClick(value)}
					>
						{tIndex(value)}
					</span>
				</li>
			))}
		</ul>
	);
};

export { DictMenu };
