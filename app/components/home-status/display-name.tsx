import SpeakerIcon from "@/assets/svg/speaker.svg";
import { useDevice } from "@/hooks/use-device";
import { useHoverToSearch } from "@/hooks/use-hover-to-search";
import type { DictItem } from "@/types/dict";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";
import { romanize, standardizePronunciation } from "es-hangul";
import { Star } from "./star";

const DisplayName = ({
	currentWord,
	playWord,
	isWordPlaying,
	isLocalDict,
	className,
}: {
	currentWord: DictItem | null;
	playWord: () => void;
	isWordPlaying: boolean;
	isLocalDict: boolean;
	className?: string;
}) => {
	const displayNameRef = useHoverToSearch(currentWord?.name);
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
			<div
				className={clsx(
					"flex absolute top-1/2 -right-10 -translate-x-1/2 -translate-y-[90%] z-[1]",
					!isTouchable && "tooltip tooltip-top",
				)}
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
			<Star dictItem={currentWord} isLocalDict={isLocalDict} />
		</div>
	);
};

export { DisplayName };
