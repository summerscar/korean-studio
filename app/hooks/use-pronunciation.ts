// import { createToast } from "@/hooks/use-toast";
import {
	useDebounceFn,
	useLatest,
	useMemoizedFn,
	useThrottleFn,
	useUpdateEffect,
} from "ahooks";
import { useEffect, useRef, useState } from "react";

const pronunciationApi = "https://dict.youdao.com/dictvoice?audio=";
function generateWordSoundSrc(word: string) {
	return `${pronunciationApi}${word}&le=kr`;
}

const usePronunciation = (
	word: string | undefined,
	{ autoPlay, preload }: { autoPlay?: boolean; preload?: boolean } = {
		autoPlay: false,
		preload: false,
	},
) => {
	const audioRef = useRef<HTMLAudioElement>(undefined);
	const [isPlaying, setIsPlaying] = useState(false);
	const lastedAutoPlay = useLatest(autoPlay);

	useEffect(() => {
		if (word) {
			setIsPlaying(false);

			if (!audioRef.current) {
				const audio = new Audio();
				audioRef.current = audio;
				const handleSetPlaying = () => {
					setIsPlaying(true);
				};
				const handleSetNotPlaying = () => {
					setIsPlaying(false);
				};
				audio.onplay = handleSetPlaying;
				audio.onerror = handleSetNotPlaying;
				audio.onended = handleSetNotPlaying;
			}

			audioRef.current.src = generateWordSoundSrc(word);
			audioRef.current.preload = preload ? "auto" : "none";
		}
	}, [preload, word]);

	useUpdateEffect(() => {
		if (lastedAutoPlay.current) {
			debouncedPlay();
		}
	}, [word]);

	const play = useMemoizedFn(async () => {
		if (audioRef.current) {
			try {
				await audioRef.current.play();
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (e: any) {
				// createToast({
				// 	type: "error",
				// 	message: e.message,
				// });
				console.error(e);
			}
		}
	});

	const { run: debouncedPlay } = useDebounceFn(play, { wait: 800 });
	const { run: throttledPlay } = useThrottleFn(play, { wait: 500 });

	return { isPlaying, play: throttledPlay };
};

export { usePronunciation };
