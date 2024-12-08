import { HideText } from "@/components/hide-text";
import { Pronunciation } from "@/components/pronunciation";
import { useHoverToSearch } from "@/hooks/use-hover-to-search";
import type { DictItem } from "@/types/dict";
import { SITES_LANGUAGE } from "@/types/site";
import { notoKR } from "@/utils/fonts";
import { generateWordSuggestionPrompt } from "@/utils/prompts";
import clsx from "clsx";
import { useMemo } from "react";
import reactStringReplace from "react-string-replace";

const WordExample = ({
	currentWord,
	playRef,
	showMeaning,
	additionalMeaning,
	locale,
	className,
	pronunciationPreload = false,
}: {
	currentWord: DictItem | null;
	playRef: React.RefObject<() => void>;
	showMeaning: boolean;
	additionalMeaning: boolean;
	locale: SITES_LANGUAGE;
	className?: string;
	pronunciationPreload?: boolean;
}) => {
	const [exampleRef, exampleHoverPanel] = useHoverToSearch(
		currentWord?.example,
		generateWordSuggestionPrompt,
	);

	const exTranslations = useMemo(() => {
		if (!currentWord) return null;
		return Object.entries(currentWord.exTrans || {}).reduce(
			(prev, [key, tran]) => {
				return Object.assign(prev, { [key]: tran.join(", ") });
			},
			{} as Record<SITES_LANGUAGE, string>,
		);
	}, [currentWord]);

	const highLightExample = (example?: string) => {
		const displayName = currentWord?.name || "";
		return reactStringReplace(example, displayName, (match, index) => (
			<b className={notoKR.className} key={index}>
				{match}
			</b>
		));
	};

	if (!currentWord?.example) return null;

	return (
		<div
			className={clsx(
				"flex justify-center flex-col items-center text-center",
				className,
			)}
		>
			<p className={clsx("relative", notoKR.className)}>
				<span ref={exampleRef}>{highLightExample(currentWord.example)}</span>
				<Pronunciation
					preload={pronunciationPreload}
					playRef={playRef}
					width={12}
					height={12}
					text={currentWord.example}
					className="absolute top-1/2 -right-6 -translate-x-1/2 -translate-y-1/2"
				/>
			</p>
			<p>
				<HideText hide={!showMeaning}>
					{exTranslations?.[locale] || exTranslations?.en}
				</HideText>
			</p>
			{/* 额外例句翻译 */}
			{additionalMeaning && (
				<div className="flex text-center flex-col gap-0.5 py-0.5">
					{Object.values(SITES_LANGUAGE)
						.filter((lang) => lang !== locale)
						.map((lang) => (
							<div
								key={lang}
								data-lang={lang}
								className="text-xs text-base-content/80"
							>
								<HideText hide={!showMeaning}>
									{exTranslations?.[lang] || exTranslations?.en}
								</HideText>
							</div>
						))}
				</div>
			)}
			{exampleHoverPanel}
		</div>
	);
};

export { WordExample };
