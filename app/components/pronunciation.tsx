"use client";
import SpeakerSVG from "@/assets/svg/speaker.svg";
import { usePronunciation } from "@/hooks/use-pronunciation";
import clsx from "clsx";
import { romanize, standardizePronunciation } from "es-hangul";
import type { ComponentProps, RefObject } from "react";

const Pronunciation = ({
	playRef,
	preload = false,
	text,
	children,
	tooltip = false,
	tooltipText,
	autoPlay = false,
	...svgProps
}: {
	text?: string;
	preload?: boolean;
	tooltip?: boolean;
	tooltipText?: string;
	autoPlay?: boolean;
	playRef?: RefObject<() => void>;
} & ComponentProps<typeof SpeakerSVG>) => {
	const DEFAULT_SIZE = 16;
	const {
		width = DEFAULT_SIZE,
		height = DEFAULT_SIZE,
		className,
		...rest
	} = svgProps;
	const targetText = typeof children === "string" ? children : text || "";
	const { isPlaying, play } = usePronunciation(targetText, {
		preload,
		autoPlay,
	});

	playRef && (playRef.current = play);

	const speakerEl = (
		<SpeakerSVG
			width={width}
			height={height}
			onMouseEnter={play}
			onTouchEnd={play}
			className={clsx(
				className,
				isPlaying ? "fill-current" : "text-base-content",
				"cursor-pointer inline-block",
			)}
			{...rest}
		/>
	);

	return (
		<>
			{children}{" "}
			{tooltip && targetText.length < 10 ? (
				<span
					className="tooltip inline-flex"
					data-tip={
						tooltipText ||
						`[${standardizePronunciation(targetText, {
							hardConversion: true,
						})}] ${romanize(targetText)}`
					}
				>
					{speakerEl}
				</span>
			) : (
				speakerEl
			)}
		</>
	);
};

const MDXSpeaker = (props: ComponentProps<typeof Pronunciation>) => (
	<Pronunciation preload={false} tooltip {...props} />
);

export { Pronunciation, MDXSpeaker };
