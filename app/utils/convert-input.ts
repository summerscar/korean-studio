import type { InputKeys } from "@/types";

export const spaceStr = "␣";

export const PrevKeyShortcut = "BracketLeft";
export const NextKeyShortcut = "BracketRight";

export const keyCodeToQwerty = (keyCode: string) => {
	return keyCode.toLowerCase().replace(/^key/, "");
};

export const isShift = (keyCode: string) => {
	return keyCode.toLowerCase().includes("shift");
};
export const isSpace = (keyCode: string) => {
	return keyCode.toLowerCase() === "space";
};
export const isShiftOnly = (input: InputKeys) => {
	return Object.keys(input).every(isShift) && Object.keys(input).length === 1;
};

export const isNavShortcut = (input: InputKeys) => {
	return Object.keys(input).some((_) =>
		[NextKeyShortcut, PrevKeyShortcut].includes(_),
	);
};

export const isEmptyInput = (input: InputKeys) => {
	return Object.keys(input).length === 0;
};

export const parseSpaceStr = (str: string) => {
	return str.replace(/ /g, spaceStr).replace(/(space|Space)/g, spaceStr);
};
/**
 * {keyD: true, space: true, ShiftLeft: true} => ["D", "␣", "shiftleft"]
 *
 * {keyD: true, space: true} => ["d", "␣"]
 */
export const convertInputsToQwerty = (input: InputKeys) => {
	const keyCodeList = Object.keys(input);
	const isWithShift = keyCodeList.some(isShift);
	const keysList = keyCodeList.map((keyCode) => {
		const key = parseSpaceStr(keyCodeToQwerty(keyCode));
		return isWithShift && !isShift(key) ? key.toUpperCase() : key;
	});
	return keysList;
};
