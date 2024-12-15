import { useDevice } from "@/hooks/use-device";
import { useHoverToSearch } from "@/hooks/use-hover-to-search";
import type { DictItem } from "@/types/dict";
import { notoKR } from "@/utils/fonts";
import { generateWordSuggestionPrompt } from "@/utils/prompts";
import clsx from "clsx";
import { romanize, standardizePronunciation } from "es-hangul";
import { Pronunciation } from "../pronunciation";
import { Star } from "./star";

const DisplayName = ({
	currentWord,
	playWordRef,
	isLocalDict,
	className,
	showStar = true,
	autoPlay,
}: {
	currentWord: DictItem | null;
	isLocalDict: boolean;
	showStar?: boolean;
	className?: string;
	playWordRef?: React.RefObject<() => void>;
	autoPlay: boolean;
}) => {
	const [displayNameRef, displayNameHoverPanel] = useHoverToSearch(
		currentWord?.name,
		generateWordSuggestionPrompt,
	);
	const displayName = currentWord?.name || "";
	const { isTouchable } = useDevice();

	/** 韩文字母对应的罗马拼音 */
	const romanized = romanize(displayName);

	/** 韩文标准化发音 */
	const standardized = standardizePronunciation(displayName, {
		hardConversion: true,
	});

	if (!currentWord) return null;

	return (
		<div
			className={clsx(
				notoKR.className,
				"text-4xl font-bold relative text-center",
				className,
			)}
		>
			<span ref={displayNameRef}>{displayName}</span>
			<div className="absolute min-h-full top-0 right-0 translate-x-[130%] z-[2] flex flex-col justify-center gap-1">
				<Pronunciation
					preload={false}
					playRef={playWordRef}
					tooltipText={`${romanized} [${standardized}]`}
					width={20}
					height={20}
					text={displayName}
					tooltip={!isTouchable}
					autoPlay={autoPlay}
				/>
				{showStar && <Star dictItem={currentWord} isLocalDict={isLocalDict} />}
			</div>
			{displayNameHoverPanel}
		</div>
	);
};

export { DisplayName };
