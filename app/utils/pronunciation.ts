const pronunciationApi = "https://dict.youdao.com/dictvoice?audio=";
export function generateWordSoundSrc(word: string) {
	return `${pronunciationApi}${word}&le=kr`;
}

let isPlaying = false;

export function playWordSound(word: string) {
	if (isPlaying) return;
	isPlaying = true;
	const audio = new Audio(generateWordSoundSrc(word));
	audio.play();
	audio.onended = () => {
		isPlaying = false;
	};
	audio.onerror = () => {
		isPlaying = false;
	};
}
