"use client";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import { KEYS_TO_BIND } from "@/utils/kr-const";
import {
	useClickAway,
	useEventListener,
	useMount,
	useUpdateEffect,
} from "ahooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

const HomeInput = ({
	onInput,
}: { onInput?: (inputKeys: Record<string, boolean>) => void }) => {
	const [currentInputKeys, setCurrentInputKeys] = useState<
		Record<string, boolean>
	>({});
	const [isInputFocused, setIsInputFocused] = useState(false);

	const inputRef = useHotkeys<HTMLInputElement>(
		["esc", ...KEYS_TO_BIND],
		(keyboardEvent) => {
			const { code, type, shiftKey, key } = keyboardEvent;
			if (key === "Escape") {
				inputRef.current?.blur();
				return;
			}

			if (type === "keydown") {
				console.log("↓", code, key, shiftKey);
				setCurrentInputKeys((prev) => ({ ...prev, [code]: true }));
			} else if (type === "keyup") {
				console.log("↑", code, key, shiftKey);

				setCurrentInputKeys((prev) => {
					const res = { ...prev };
					delete res[code];
					return { ...res };
				});
			}
		},
		{ enableOnFormTags: true, keyup: true, keydown: true },
		[onInput],
	);

	useUpdateEffect(() => {
		if (onInput) {
			onInput(currentInputKeys);
		}
	}, [currentInputKeys, onInput]);

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
		const activeColor = "bisque";
		return Object.keys(currentInputKeys).reduce((prev, keyCode) => {
			return `${prev}.${keyCode.toLowerCase().replace(/^key/, "")} {fill: ${activeColor};}
  .shift {${keyCode.toLowerCase().includes("shift") ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [currentInputKeys]);

	return (
		<div className="flex flex-col w-full items-center">
			<input type="text" ref={inputRef} />
			<p>isFocus: {`${isInputFocused}`} Enter</p>
			<p>{Object.keys(currentInputKeys).join(" - ")}</p>
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
