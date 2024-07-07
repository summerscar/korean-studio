"use client";
import { KEYS_TO_BIND } from "@/utils/kr-const";
import { useEventListener, useUpdateEffect } from "ahooks";
import clsx from "clsx";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type HomeInputRef = {
	handleInputBlur: () => void;
	handleInputFocus: () => void;
};

const HomeInput = forwardRef<
	HomeInputRef,
	{ onInput?: (inputKeys: Record<string, boolean>) => void }
>(({ onInput }, ref) => {
	const [currentInputKeys, setCurrentInputKeys] = useState<
		Record<string, boolean>
	>({});
	const [isInputFocused, setIsInputFocused] = useState(false);

	const inputRef = useHotkeys<HTMLInputElement>(
		["esc", ...KEYS_TO_BIND],
		(keyboardEvent) => {
			const { code, type, key } = keyboardEvent;
			if (key === "Escape") {
				handleInputBlur();
				return;
			}

			if (type === "keydown") {
				setCurrentInputKeys((prev) => ({ ...prev, [code]: true }));
			} else if (type === "keyup") {
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

	const handleInputFocus = useCallback(() => {
		// debugger;
		inputRef.current?.focus();
	}, [inputRef]);
	const handleInputBlur = useCallback(() => {
		inputRef.current?.blur();
	}, [inputRef]);

	useImperativeHandle(ref, () => ({
		handleInputFocus,
		handleInputBlur,
	}));

	useUpdateEffect(() => {
		if (onInput) {
			onInput(currentInputKeys);
		}
	}, [currentInputKeys, onInput]);

	useHotkeys(
		["enter"],
		() => {
			handleInputFocus();
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

	return (
		<div
			className={clsx(
				isInputFocused
					? "animate-[1s_ease_0s_infinite_normal_none_running_blink]"
					: "opacity-0",
				"absolute top-0 left-0 w-[2px] h-[23px] overflow-hidden bg-black",
			)}
		>
			<input className="opacity-0 w-0 h-0" type="text" ref={inputRef} />
		</div>
	);
});
export { HomeInput };
