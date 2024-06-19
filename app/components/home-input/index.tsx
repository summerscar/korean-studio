"use client";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import { KEYS_TO_BIND } from "@/utils/keys-to-bind";
import { useClickAway } from "ahooks";
import { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const HomeInput = () => {
	const [currentInputKeys, setCurrentInputKeys] = useState<
		[string, string, boolean] | []
	>([]);
	const inputRef = useHotkeys<HTMLInputElement>(
		["esc", ...KEYS_TO_BIND],
		({ code, type, shiftKey, key }, hotkeysEvent) => {
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
		[],
	);

	useHotkeys(
		["enter"],
		(keyboardEvent, hotkeysEvent) => {
			inputRef.current?.focus();
		},
		[],
	);

	useClickAway(() => {
		// inputRef.current?.blur();
	}, inputRef);

	const inlineStyle = currentInputKeys.length
		? `.${currentInputKeys[1].toLowerCase()} {fill: bisque;} .shift {${currentInputKeys[2] ? "fill: bisque;" : ""}}`
		: "";

	return (
		<div className="flex flex-col w-full items-center">
			<input type="text" ref={inputRef} />
			<button type="button">Enter</button>
			<p>{currentInputKeys.length ? currentInputKeys.join("-") : "-"}</p>
			<p className="w-10/12">
				<style
					// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
					dangerouslySetInnerHTML={{
						__html: inlineStyle,
					}}
				/>
				<KoreanKeyBoardSVG
					viewBox="0 0 960 300"
					width={"100%"}
					height={"100%"}
				/>
			</p>
		</div>
	);
};
export { HomeInput };
