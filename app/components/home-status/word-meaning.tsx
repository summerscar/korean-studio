import { HideText } from "@/components/hide-text";
import type { DictItem } from "@/types/dict";
import { SITES_LANGUAGE } from "@/types/site";
import clsx from "clsx";
import { useMemo } from "react";

const WordMeaning = ({
	showMeaning,
	currentWord,
	locale,
	additionalMeaning,
	className,
}: {
	showMeaning: boolean;
	currentWord: DictItem | null;
	locale: SITES_LANGUAGE;
	additionalMeaning: boolean;
	className?: string;
}) => {
	const wordTranslations = useMemo(() => {
		if (!currentWord) return null;
		return Object.entries(currentWord.trans).reduce(
			(prev, [key, tran]) => {
				return Object.assign(prev, { [key]: tran.join(", ") });
			},
			{} as Record<SITES_LANGUAGE, string>,
		);
	}, [currentWord]);

	return (
		<>
			<div
				className={clsx(
					"text-lg text-gray-500 mt-3 mb-2 text-center",
					className,
				)}
			>
				<HideText hide={!showMeaning}>
					{wordTranslations?.[locale] || wordTranslations?.en}
				</HideText>
			</div>
			{/* 额外翻译 */}
			{additionalMeaning && (
				<HideText
					hide={!showMeaning}
					className={clsx("mb-3 -mt-1.5 block mobile:max-w-[90vw]")}
				>
					<div className="flex flex-row gap-3">
						{Object.values(SITES_LANGUAGE)
							.filter((lang) => lang !== locale)
							.map((lang) => (
								<span
									key={lang}
									data-lang={lang}
									className="text-xs text-gray-500/80 text-center"
								>
									{wordTranslations?.[lang] || wordTranslations?.en}
								</span>
							))}
					</div>
				</HideText>
			)}
		</>
	);
};

export { WordMeaning };
