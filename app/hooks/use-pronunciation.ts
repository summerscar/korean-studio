import { useMemoizedFn } from "ahooks";
import { useEffect, useRef, useState } from "react";

const pronunciationApi = "https://dict.youdao.com/dictvoice?audio=";
function generateWordSoundSrc(word: string) {
	return `${pronunciationApi}${word}&le=kr`;
}

const usePronunciation = (
	word: string | undefined,
	{ autoPlay }: { autoPlay: boolean } = { autoPlay: false },
) => {
	const audioRef = useRef<HTMLAudioElement>();
	const [isPlaying, setIsPlaying] = useState(false);

	useEffect(() => {
		if (word) {
			setIsPlaying(false);

			if (!audioRef.current) {
				const audio = new Audio();
				audio.crossOrigin = "anonymous";
				audio.preload = "auto";
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
			if (autoPlay) {
				audioRef.current.play();
			}
		}
	}, [autoPlay, word]);

	const play = useMemoizedFn(() => {
		if (audioRef.current) {
			audioRef.current.play();
		}
	});

	return { isPlaying, play };
};

export { usePronunciation };
