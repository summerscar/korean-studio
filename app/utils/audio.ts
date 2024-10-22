import { useMount } from "ahooks";
import { useRef } from "react";

const backspaceAudio = "/audio/backspace.mp3";
const baseInputAudio = "/audio/enter.mp3";
const incorrectAudio = "/audio/incorrect.mp3";
const spaceAudio = "/audio/space.mp3";
const swapAudio = "/audio/swap.mp3";

class InputAudioEffect {
	constructor(src: string) {
		this.audio = new Audio();
		this.audio.src = src;
		this.audio.preload = "auto";
		this.audio.volume = 1;
	}

	private audio: HTMLAudioElement;

	play() {
		this.audio.currentTime = 0;
		this.audio.play();
	}

	pause() {
		this.audio.pause();
	}

	setVolume(volume: number) {
		this.audio.volume = volume;
	}

	setRate(rate: number) {
		this.audio.playbackRate = rate;
	}
}

export const createInputAE = () => {
	const baseInputAE = new InputAudioEffect(baseInputAudio);
	const incorrectAE = new InputAudioEffect(incorrectAudio);
	const spaceAE = new InputAudioEffect(spaceAudio);
	const backspaceAE = new InputAudioEffect(backspaceAudio);
	const swapAE = new InputAudioEffect(swapAudio);
	return { baseInputAE, incorrectAE, spaceAE, backspaceAE, swapAE };
};

export const useInputAudioEffect = () => {
	const audioEffectRef = useRef<ReturnType<typeof createInputAE>>(undefined);
	useMount(() => {
		audioEffectRef.current = createInputAE();
	});
	return audioEffectRef;
};
