import type { InputKeys } from "@/types";

export const keyCodeToQwerty = (keyCode: string) => {
	return keyCode.toLowerCase().replace(/^key/, "");
};

export const isShift = (keyCode: string) => {
	return keyCode.toLowerCase().includes("shift");
};

export const isShiftOnly = (input: InputKeys) => {
	return Object.keys(input).every(isShift) && Object.keys(input).length === 1;
};

export const isEmptyInput = (input: InputKeys) => {
	return Object.keys(input).length === 0;
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
