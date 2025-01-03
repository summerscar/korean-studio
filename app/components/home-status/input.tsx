"use client";
import { KEYS_TO_BIND } from "@/utils/kr-const";
import { useEventListener, useUpdateEffect } from "ahooks";
import clsx from "clsx";
import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

export type HomeInputRef = {
	handleInputBlur: () => void;
	handleInputFocus: () => void;
};

const HomeInput = ({
	onInput,
	position,
	onFocusChange,
	ref,
}: {
	onInput?: (inputKeys: Record<string, boolean>) => void;
	position?: DOMRect;
	onFocusChange?: (isFocused: boolean) => void;
	ref: React.RefObject<HomeInputRef>;
}) => {
	const [currentInputKeys, setCurrentInputKeys] = useState<
		Record<string, boolean>
	>({});
	const [isInputFocused, setIsInputFocused] = useState(false);

	useEffect(() => {
		onFocusChange?.(isInputFocused);
	}, [isInputFocused, onFocusChange]);

	const inputRef = useHotkeys<HTMLInputElement>(
		["esc", "backspace", "space", ...KEYS_TO_BIND],
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
		// debugger;
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
			// 防止 transition-all 乱飘
			setTimeout(() => {
				setIsInputFocused(true);
			}, 16);
		},
		{ target: inputRef },
	);

	const style = position
		? {
				left: `${position.left}px`,
				top: `${position.top}px`,
			}
		: undefined;

	return (
		<div
			className={clsx(
				isInputFocused
					? "animate-[1s_ease_0s_infinite_normal_none_running_blink] transition-all"
					: "opacity-0",
				"fixed top-0 left-0 w-[2px] h-[23px] overflow-hidden bg-base-content translate-y-1",
			)}
			style={style}
		>
			<input className="opacity-0 w-0 h-0" type="text" ref={inputRef} />
		</div>
	);
};
export { HomeInput };
