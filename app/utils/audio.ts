import backspaceAudio from "@/assets/audio/backspace.mp3";
import baseInputAudio from "@/assets/audio/enter.mp3";
import incorrectAudio from "@/assets/audio/incorrect.mp3";
import spaceAudio from "@/assets/audio/space.mp3";

class InputAudioEffect {
	constructor(src: string) {
		this.audio = new Audio();
		this.audio.src = src;
		this.audio.preload = "auto";
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

const baseInputAE = new InputAudioEffect(baseInputAudio);
const incorrectAE = new InputAudioEffect(incorrectAudio);
const spaceAE = new InputAudioEffect(spaceAudio);
const backspaceAE = new InputAudioEffect(backspaceAudio);

export { baseInputAE, incorrectAE, spaceAE, backspaceAE };
