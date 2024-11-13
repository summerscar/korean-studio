"use client";
import SpeakerSVG from "@/assets/svg/speaker.svg";
import { usePronunciation } from "@/hooks/use-pronunciation";
import clsx from "clsx";
import { romanize } from "es-hangul";
import type { ComponentProps } from "react";

const Pronunciation = ({
	preload = true,
	text,
	children,
	tooltip = false,
	...svgProps
}: { text?: string; preload?: boolean; tooltip?: boolean } & ComponentProps<
	typeof SpeakerSVG
>) => {
	const DEFAULT_SIZE = 16;
	const {
		width = DEFAULT_SIZE,
		height = DEFAULT_SIZE,
		className,
		...rest
	} = svgProps;
	const targetText = typeof children === "string" ? children : text || "";
	const { isPlaying, play } = usePronunciation(targetText, { preload });

	const speakerEl = (
		<SpeakerSVG
			width={width}
			height={height}
			onMouseEnter={play}
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
				<span className="tooltip" data-tip={romanize(targetText)}>
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
