import SpeakerSVG from "@/assets/svg/speaker.svg";
import { usePronunciation } from "@/hooks/use-pronunciation";
import clsx from "clsx";
import type { ComponentProps } from "react";

const Pronunciation = ({
	text,
	...svgProps
}: { text?: string } & ComponentProps<typeof SpeakerSVG>) => {
	const { width = 16, height = 16, className, ...rest } = svgProps;
	const { isPlaying, play } = usePronunciation(text);

	return (
		<SpeakerSVG
			width={width}
			height={height}
			onMouseEnter={play}
			className={clsx(
				className,
				isPlaying ? "text-accent" : "text-base-content",
				"cursor-pointer",
			)}
			{...rest}
		/>
	);
};

export { Pronunciation };
