import type { InputKeys } from "@/types";

export const keyCodeToQwerty = (keyCode: string) => {
	return keyCode.toLowerCase().replace(/^key/, "");
};

export const isShift = (keyCode: string) => {
	return keyCode.toLowerCase().includes("shift");
};

export const convertInputsToQwerty = (input: InputKeys) => {
	const keyCodeList = Object.keys(input);
	const isWithShift = keyCodeList.some(isShift);
	const keysList = keyCodeList.map((keyCode) => {
		const key = keyCodeToQwerty(keyCode);
		return isWithShift ? key.toUpperCase() : key;
	});
	return keysList;
};
