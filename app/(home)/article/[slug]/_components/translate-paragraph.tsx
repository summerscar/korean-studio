"use client";
import { papagoTranslateAction } from "@/actions/papago-translate-action";
import TranslateIcon from "@/assets/svg/translate.svg";
import { HighLightedText } from "@/components/high-lighted-text";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { notoKR } from "@/utils/fonts";
import { isKorean } from "@/utils/is-korean";
import clsx from "clsx";
import { useLocale } from "next-intl";

const TranslateParagraph = ({
	children,
	articleId,
	chapterId,
	paragraphIndex,
	...props
}: {
	children: React.ReactNode;
	paragraphIndex: number;
	articleId: string;
	chapterId?: string;
}) => {
	const locale = useLocale();

	const text = typeof children === "string" ? children : "";
	const isKoreanText = isKorean(text);

	const [pending, translate, data] = useServerActionState(async () => {
		if (!text) return undefined;
		return await papagoTranslateAction(text, locale);
	});

	return (
		<div className="flex mb-4 group flex-wrap relative">
			{isKoreanText ? (
				<div className={clsx("select-none left-0 top-0.5 absolute")}>
					{pending ? (
						<span className="loading loading-spinner loading-xs size-4" />
					) : (
						<TranslateIcon
							onClick={translate}
							className={clsx(
								"border rounded border-base-content group-hover:block mobile:block hidden size-4 cursor-pointer translate-y-[3px]",
								pending && "animate-pulse pointer-events-none",
								data && "!hidden",
							)}
						/>
					)}
				</div>
			) : null}

			<p
				className={clsx(
					"!mb-0 w-full",
					isKoreanText && "pl-5",
					notoKR.className,
				)}
				lang="ko"
				{...props}
			>
				<HighLightedText
					paragraphIndex={paragraphIndex}
					articleId={articleId}
					chapterId={chapterId || undefined}
				>
					{children}
				</HighLightedText>
			</p>
			{data && (
				<p
					className="!mb-0 pl-5 !mt-1 w-full shrink-0 text-base-content/60"
					lang={locale}
				>
					{data.translatedText}
				</p>
			)}
		</div>
	);
};
export { TranslateParagraph };
