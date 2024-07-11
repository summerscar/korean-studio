"use client";
import CompleteSVG from "@/assets/svg/complete.svg";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import RefreshSVG from "@/assets/svg/refresh.svg";
import { DictNav } from "@/components/dict-nav";
import { HomeInput } from "@/components/home-input";
import { SizedConfetti } from "@/components/sized-confetti";
// https://www.lexilogos.com/code/conkr.js
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import {
	NextKeyShortcut,
	PrevKeyShortcut,
	convertInputsToQwerty,
	isEmptyInput,
	isNavShortcut,
	isShift,
	isShiftOnly,
	isSpace,
	keyCodeToQwerty,
	parseSpaceStr,
} from "@/utils/convert-input";
import { notoKR } from "@/utils/fonts";
import { hangulToQwerty } from "@/utils/kr-const";
import { useClickAway, useMemoizedFn } from "ahooks";
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
	const [isComplete, setIsComplete] = useState(false);
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
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (hangulRef.current) {
			inputRef.current.handleInputFocus?.();
		}
		const hangulEls = hangulRef.current?.children;
		if (!hangulEls || curInputIndex >= hangulEls.length) return;
		const currentSpan = hangulEls[curInputIndex] as HTMLSpanElement;
		const rect = currentSpan.getBoundingClientRect();
		setInputPosition(rect);
	}, [curInputIndex, curWordIndex]);

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
	const hangul = parseSpaceStr(disassembleHangul(displayName));
	/** 韩文字母对应的键盘输入 */
	const qwerty = parseSpaceStr(hangulToQwerty(hangul));

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
			if (!isShiftOnly(inputKeys) && !isNavShortcut(inputKeys)) {
				setIsInputError(true);
				addShakeAnimation(hangulRef.current!);
			}
			return prev;
		});
	}, [inputKeys, qwerty, addShakeAnimation]);

	const focusInput = useCallback(() => {
		inputRef.current.handleInputFocus?.();
	}, []);
	const blurInput = useCallback(() => {
		inputRef.current.handleInputBlur?.();
	}, []);

	const skipToNextWord = useCallback(
		(nextWordIndex: number) => {
			if (nextWordIndex >= dict.length) {
				setIsComplete(true);
				setTimeout(blurInput);
			} else {
				setIsComplete(false);
				setTimeout(focusInput);
			}
			const targetIndex = Math.max(0, nextWordIndex);
			setCurWordIndex(targetIndex);
			setCurInputIndex(0);
			setIsInputError(false);
			console.log(
				`skip to next word! ${targetIndex + 1}/${dict.length}  \n`,
				dict[targetIndex],
			);
		},
		[focusInput, dict, blurInput],
	);

	const toPrevWord = useMemoizedFn(() => {
		skipToNextWord(curWordIndex - 1);
	});

	const toNextWord = useMemoizedFn(() => {
		skipToNextWord(curWordIndex + 1);
	});
	const toNextWordWithCheck = useMemoizedFn(() => {
		const nextWordIndex = curWordIndex + 1;
		if (nextWordIndex >= dict.length) {
			return;
		}
		toNextWord();
	});
	const resetWord = useMemoizedFn(() => {
		skipToNextWord(0);
	});

	/** 完成输入，下一个单词 TODO: 放在useEffect可能有点问题 */
	useEffect(() => {
		if (curInputIndex >= hangul.length && isEmptyInput(inputKeys)) {
			setConfetti(true);
			toNextWord();
		}
	}, [curInputIndex, hangul, inputKeys, toNextWord]);

	useEffect(() => {
		const inputKeysArr = Object.keys(inputKeys);
		if (inputKeysArr.includes(PrevKeyShortcut)) {
			toPrevWord();
			return;
		}
		if (inputKeysArr.includes(NextKeyShortcut)) {
			toNextWordWithCheck();
			return;
		}
	}, [inputKeys, toPrevWord, toNextWordWithCheck]);

	const translation = useMemo(() => {
		if (!currentWord) return null;
		const trans =
			currentWord.trans[locale as keyof Tran] || currentWord.trans.en;
		return trans.join(", ");
	}, [currentWord, locale]);

	const exTranslation = useMemo(() => {
		if (!currentWord) return null;
		const exTrans =
			currentWord.exTrans[locale as keyof Tran] || currentWord.exTrans.en;
		return exTrans.join(", ");
	}, [currentWord, locale]);

	useEffect(() => {
		!isEmptyInput(inputKeys) && console.log("inputKeys:", inputKeys);
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
		.shift {${isShift(keyCode) ? `fill: ${activeColor};` : ""}}
		.space {${isSpace(keyCode) ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [inputKeys]);

	return (
		<div
			className={clsx(
				notoKR.className,
				"flex",
				"flex-col",
				"items-center",
				"justify-center",
			)}
		>
			<SizedConfetti
				style={{ pointerEvents: "none" }}
				numberOfPieces={confetti ? 1000 : 0}
				recycle={false}
				onConfettiComplete={(confetti) => {
					setConfetti(false);
					confetti?.reset();
				}}
			/>
			{isComplete && (
				<div className="flex flex-col items-center justify-center">
					<CompleteSVG />
					<RefreshSVG className="mt-5 cursor-pointer" onClick={resetWord} />
				</div>
			)}
			<DictNav
				onNext={toNextWord}
				onPrev={toPrevWord}
				dict={dict}
				curWordIndex={curWordIndex}
			/>
			<div className="text-4xl font-bold text-slate-800">{displayName}</div>
			<div className="text-lg text-gray-500">{translation}</div>
			{/* 韩语音节 */}
			<div
				className={clsx(
					"inline-block cursor-pointer text-xl text-[color:var(--font-color-inactive)]",
				)}
				ref={hangulRef}
				onClick={focusInput}
				onKeyUp={blurInput}
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
			{/* 键盘图案 */}
			<p className="w-[80vw] my-2">
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
			{/* 例句 */}
			<div className="flex justify-center flex-col items-center">
				<p className="relative">
					<span className="absolute left-0 -translate-x-full pr-1">Ex. </span>
					{currentWord?.example}
				</p>
				<p>{exTranslation}</p>
			</div>
			{/* 键盘输入 */}
			<div className="text-[color:var(--font-color-inactive)]">
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
			<HomeInput
				onInput={setInputKeys}
				position={inputPosition}
				ref={inputRef}
			/>
		</div>
	);
};

export { HomeStatus };
