import SpeakerIcon from "@/assets/svg/speaker.svg";
import { useDevice } from "@/hooks/use-device";
import { useHoverToSearch } from "@/hooks/use-hover-to-search";
import type { DictItem } from "@/types/dict";
import { notoKR } from "@/utils/fonts";
import { generateWordSuggestionPrompt } from "@/utils/prompts";
import clsx from "clsx";
import { romanize, standardizePronunciation } from "es-hangul";
import { Star } from "./star";

const DisplayName = ({
	currentWord,
	playWord,
	isWordPlaying,
	isLocalDict,
	className,
	showStar = true,
}: {
	currentWord: DictItem | null;
	playWord: () => void;
	isWordPlaying: boolean;
	isLocalDict: boolean;
	showStar?: boolean;
	className?: string;
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
				<div
					className={clsx("flex", !isTouchable && "tooltip tooltip-top")}
					data-tip={`${romanized} [${standardized}]`}
				>
					<SpeakerIcon
						width={20}
						height={20}
						onMouseEnter={playWord}
						onTouchEnd={playWord}
						className={clsx(
							isWordPlaying ? "fill-current" : "text-base-content",
							"cursor-pointer inline-block",
						)}
					/>
				</div>
				{showStar && <Star dictItem={currentWord} isLocalDict={isLocalDict} />}
			</div>
			{displayNameHoverPanel}
		</div>
	);
};

export { DisplayName };
