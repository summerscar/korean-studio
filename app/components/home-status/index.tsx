"use client";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import { HomeInput } from "@/components/home-input";
import { SizedConfetti } from "@/components/sized-confetti";
// https://www.lexilogos.com/code/conkr.js
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import {
	convertInputsToQwerty,
	isEmptyInput,
	isShift,
	isShiftOnly,
	keyCodeToQwerty,
} from "@/utils/convert-input";
import { notoKR } from "@/utils/fonts";
import { hangulToQwerty } from "@/utils/kr-const";
import { useClickAway } from "ahooks";
import clsx from "clsx";
import { disassembleHangul } from "es-hangul";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HomeStatus = ({
	dict,
}: {
	dict: Dict;
}) => {
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const [isInputError, setIsInputError] = useState(false);
	const locale = useLocale();
	const [confetti, setConfetti] = useState(false);
	const hangulRef = useRef<HTMLDivElement>(null);
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});
	const inputRef = useRef({
		handleInputBlur: () => {},
		handleInputFocus: () => {},
	});

	/** 计算input光标位置 */
	const [inputPosition, setInputPosition] = useState<DOMRect>();
	useEffect(() => {
		if (hangulRef.current) {
			inputRef.current.handleInputFocus?.();
		}
		const hangulEls = hangulRef.current?.children;
		if (!hangulEls || curInputIndex >= hangulEls.length) return;
		const currentSpan = hangulEls[curInputIndex] as HTMLSpanElement;
		const rect = currentSpan.getBoundingClientRect();
		setInputPosition(rect);
	}, [curInputIndex]);

	useClickAway(() => {
		inputRef.current.handleInputBlur?.();
	}, hangulRef);

	const currentWord = useMemo(() => {
		if (curWordIndex < dict.length) {
			return dict[curWordIndex];
		}
		return null;
	}, [curWordIndex, dict]);

	/** 韩文单词 */
	const displayName = currentWord?.name || "";
	/** 韩文字母 */
	const hangul = disassembleHangul(displayName);
	/** 韩文字母对应的键盘输入 */
	const qwerty = hangulToQwerty(hangul);

	const addShakeAnimation = useCallback((target: HTMLElement) => {
		const className = "animate-[shake-text_0.25s_1]";
		const remove = () => {
			target.classList.remove(className);
			target.removeEventListener("animationend", remove);
		};
		target.classList.add(className);
		target.addEventListener("animationend", remove);
	}, []);

	useEffect(() => {
		const keysList = Object.keys(inputKeys);
		if (!keysList.length) return;

		setCurInputIndex((prev) => {
			const targetKey = (qwerty || "").substring(prev, prev + 1);
			if (!targetKey) return prev;
			const parsedInputs = convertInputsToQwerty(inputKeys);
			// backspace 需要退回一位
			if (parsedInputs.includes("backspace")) {
				setIsInputError(false);
				return Math.max(prev - 1, 0);
			}
			// 前进一位
			const isTarget = parsedInputs.find((key) => key === targetKey);
			if (isTarget) {
				setIsInputError(false);
				return prev + 1;
			}
			// 输入错误，提示下一个输入
			if (!isShiftOnly(inputKeys)) {
				setIsInputError(true);
				addShakeAnimation(hangulRef.current!);
			}
			return prev;
		});
	}, [inputKeys, qwerty, addShakeAnimation]);

	const toNextWord = useCallback(() => {
		setCurWordIndex((val) => val + 1);
		setCurInputIndex(0);
		console.log("next word!");
	}, []);

	/** 完成输入，下一个单词 */
	useEffect(() => {
		if (curInputIndex >= hangul.length && isEmptyInput(inputKeys)) {
			setConfetti(true);
			toNextWord();
		}
	}, [curInputIndex, hangul, inputKeys, toNextWord]);

	const translation = useMemo(() => {
		if (!currentWord) return null;
		const trans =
			currentWord.trans[locale as keyof Tran] || currentWord.trans.en;
		return trans.join(", ");
	}, [currentWord, locale]);

	useEffect(() => {
		console.log("inputKeys:", inputKeys);
	}, [inputKeys]);

	const heightLightClass = (strIndex: number) =>
		clsx({
			"font-bold text-[color:var(--font-color-error)]":
				isInputError && curInputIndex === strIndex,
			"text-[color:var(--font-color-active)]": curInputIndex > strIndex,
		});

	const inlineStyle = useMemo(() => {
		const activeColor = "var(--keyboard-active-color)";
		return Object.keys(inputKeys).reduce((prev, keyCode) => {
			return `${prev}.${keyCodeToQwerty(keyCode)} {fill: ${activeColor};}
		.shift {${isShift(keyCode) ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [inputKeys]);

	return (
		<div className={clsx(notoKR.className, "text-center")}>
			<SizedConfetti
				style={{ pointerEvents: "none" }}
				numberOfPieces={confetti ? 1000 : 0}
				recycle={false}
				onConfettiComplete={(confetti) => {
					setConfetti(false);
					confetti?.reset();
				}}
			/>
			<div className="text-4xl font-bold text-slate-800">{displayName}</div>
			<div className="text-lg text-gray-500">{translation}</div>
			{/* 韩语音节 */}
			<div
				className={clsx(
					"inline-block cursor-pointer text-xl text-[color:var(--font-color-inactive)]",
				)}
				ref={hangulRef}
				onClick={() => inputRef.current.handleInputFocus()}
				onKeyUp={() => inputRef.current.handleInputBlur()}
			>
				{[...hangul].map((strItem, idx) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={idx}
						className={clsx(heightLightClass(idx))}
					>
						{strItem}
					</span>
				))}
			</div>
			{/* 键盘输入 */}
			<div>
				{[...qwerty].map((strItem, idx) => (
					<span
						// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
						key={idx}
						className={clsx(heightLightClass(idx))}
					>
						{strItem}
					</span>
				))}
			</div>
			<div>{`curInputIndex: ${curInputIndex}`}</div>
			<p className="w-[80vw]">
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
			<HomeInput
				onInput={setInputKeys}
				position={inputPosition}
				ref={inputRef}
			/>
		</div>
	);
};

export { HomeStatus };
