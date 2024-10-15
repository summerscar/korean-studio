"use client";
import SpeakerSVG from "@/assets/svg/speaker.svg";
import { usePronunciation } from "@/hooks/use-pronunciation";
import clsx from "clsx";
import type { ComponentProps } from "react";

const Pronunciation = ({
	preload = true,
	text,
	children,
	...svgProps
}: { text?: string; preload?: boolean } & ComponentProps<
	typeof SpeakerSVG
>) => {
	const DEFAULT_SIZE = 16;
	const {
		width = DEFAULT_SIZE,
		height = DEFAULT_SIZE,
		className,
		...rest
	} = svgProps;

	const { isPlaying, play } = usePronunciation(
		typeof children === "string" ? children : text,
		{ preload },
	);

	return (
		<>
			{children}{" "}
			<SpeakerSVG
				width={width}
				height={height}
				onMouseEnter={play}
				className={clsx(
					className,
					isPlaying ? "text-accent" : "text-base-content",
					"cursor-pointer inline-block",
				)}
				{...rest}
			/>
		</>
	);
};

const MDXSpeaker = (props: ComponentProps<typeof Pronunciation>) => (
	<Pronunciation preload={false} {...props} />
);

export { Pronunciation, MDXSpeaker };
