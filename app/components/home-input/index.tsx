"use client";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import { KEYS_TO_BIND } from "@/utils/kr-const";
import { useClickAway, useEventListener } from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const HomeInput = ({ onInput }: { onInput?: (keyboardEvent: KeyboardEvent) => void }) => {
	const [currentInputKeys, setCurrentInputKeys] = useState<[string, string, boolean] | []>([]);

	const [isInputFocused, setIsInputFocused] = useState(false);

	const inputRef = useHotkeys<HTMLInputElement>(
		["esc", ...KEYS_TO_BIND],
		(keyboardEvent) => {
			onInput?.(keyboardEvent);
			const { code, type, shiftKey, key } = keyboardEvent;
			if (key === "Escape") {
				inputRef.current?.blur();
				return;
			}

			if (type === "keydown") {
				setCurrentInputKeys([code, key, shiftKey]);
			} else if (type === "keyup") {
				setCurrentInputKeys([]);
			}
		},
		{ enableOnFormTags: true, keyup: true, keydown: true },
		[onInput],
	);

	useHotkeys(
		["enter"],
		() => {
			inputRef.current?.focus();
		},
		[],
	);

	useEventListener(
		"blur",
		() => {
			setIsInputFocused(false);
		},
		{ target: inputRef },
	);
	useEventListener(
		"focus",
		() => {
			setIsInputFocused(true);
		},
		{ target: inputRef },
	);

	const inlineStyle = useMemo(() => {
		return currentInputKeys.length
			? `.${currentInputKeys[1].toLowerCase()} {fill: bisque;}
      .shift {${currentInputKeys[2] ? "fill: bisque;" : ""}}`
			: "";
	}, [currentInputKeys.length, currentInputKeys[1], currentInputKeys[2]]);

	return (
		<div className="flex flex-col w-full items-center">
			<input type="text" ref={inputRef} />
			<p>isFocus: {`${isInputFocused}`} Enter</p>
			<p>{currentInputKeys.length ? currentInputKeys.join("-") : "-"}</p>
			<p className="w-10/12">
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: inlineStyle,
					}}
				/>
				<KoreanKeyBoardSVG viewBox="0 0 960 300" width={"100%"} height={"100%"} />
			</p>
		</div>
	);
};
export { HomeInput };
