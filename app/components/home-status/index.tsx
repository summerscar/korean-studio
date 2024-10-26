"use client";
import CompleteSVG from "@/assets/svg/complete.svg";
import InfoIcon from "@/assets/svg/info.svg";
import KeyboardIcon from "@/assets/svg/keyboard.svg";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import RefreshSVG from "@/assets/svg/refresh.svg";
import ScoreIcon from "@/assets/svg/score.svg";
import { DictNav } from "@/components/dict-nav";
import { HomeDrawer } from "@/components/home-drawer";
import { HomeInput } from "@/components/home-input";
import { Pronunciation } from "@/components/pronunciation";
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import { useInputAudioEffect } from "@/utils/audio";
import { playConfetti } from "@/utils/confetti";
import {
	NextKeyShortcut,
	PrevKeyShortcut,
	convertInputsToQwerty,
	isBackspace,
	isEmptyInput,
	isShift,
	isShiftOnly,
	isSpace,
	keyCodeToQwerty,
	parseSpaceStr,
	spaceStr,
} from "@/utils/convert-input";
import { myeongjo, notoKR } from "@/utils/fonts";
import { isServer } from "@/utils/is-server";
import { hangulToQwerty } from "@/utils/kr-const";
import { shuffleArr } from "@/utils/shuffle-array";
import { useEventListener, useLatest, useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { disassemble, romanize, standardizePronunciation } from "es-hangul";
import { useLocale, useTranslations } from "next-intl";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import reactStringReplace from "react-string-replace";

const HomeStatus = ({
	dict: originalDict,
}: {
	dict: Dict;
}) => {
	const [dict, setDict] = useState(originalDict);
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [isInputError, setIsInputError] = useState(false);
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [showKeyboard, setShowKeyboard] = useState(true);
	const inputAE = useInputAudioEffect();
	const toggleShowKeyboard = useMemoizedFn(() =>
		setShowKeyboard(!showKeyboard),
	);
	const drawerRef = useRef({ open: () => {} });
	const locale = useLocale();
	const tHome = useTranslations("Home");
	const hangulRef = useRef<HTMLDivElement>(null);
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});
	const inputRef = useRef({
		handleInputBlur: () => {},
		handleInputFocus: () => {},
	});

	useEffect(() => {
		setDict(originalDict);
	}, [originalDict]);

	const shuffleDict = useMemoizedFn(() => {
		setDict((prev) => shuffleArr(prev));
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		resetWord();
	}, [dict]);

	useEventListener(
		"keyup",
		(e) => {
			/** 进入输入状态 */
			if (e.code === "Enter") {
				if (isInputFocused || isComplete) return;
				focusInput();
				return;
			}

			/** 单词导航 */
			if ([NextKeyShortcut, PrevKeyShortcut].includes(e.code)) {
				if (isComplete || (curWordIndex === 0 && e.code === PrevKeyShortcut))
					return;

				if (e.code === NextKeyShortcut) {
					toNextWordWithCheck();
				} else if (e.code === PrevKeyShortcut) {
					toPrevWord();
				}
				inputAE.current!.swapAE.play();
				return;
			}
		},
		{ target: isServer ? undefined : document },
	);

	/** 计算input光标位置, curWordIndex 更新时重新计算 */
	const [inputPosition, setInputPosition] = useState<DOMRect>();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (hangulRef.current) {
			focusInput();
		}
		const hangulEls = hangulRef.current?.children;
		if (!hangulEls || curInputIndex >= hangulEls.length) return;
		const currentSpan = hangulEls[curInputIndex] as HTMLSpanElement;
		const rect = currentSpan.getBoundingClientRect();
		setInputPosition(rect);
	}, [curInputIndex, curWordIndex]);

	const currentWord = useMemo(() => {
		if (curWordIndex < dict.length) {
			return dict[curWordIndex];
		}
		return null;
	}, [curWordIndex, dict]);

	/** 韩文单词 */
	const displayName = currentWord?.name || "";
	/** 韩文字母 */
	const hangul = parseSpaceStr(disassemble(displayName));
	const lastedHangul = useLatest(hangul);

	/** 韩文字母对应的键盘输入 */
	const qwerty = parseSpaceStr(hangulToQwerty(hangul));

	/** 韩文字母对应的罗马拼音 */
	const romanized = romanize(displayName);

	/** 韩文标准化发音 */
	const standardized = standardizePronunciation(displayName, {
		hardConversion: true,
	});

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
				inputAE.current!.backspaceAE.play();
				return Math.max(prev - 1, 0);
			}
			// 前进一位
			const isTarget = parsedInputs.find((key) => key === targetKey);
			if (isTarget) {
				setIsInputError(false);
				if (targetKey === spaceStr) {
					inputAE.current!.spaceAE.play();
				} else {
					inputAE.current!.baseInputAE.play();
				}
				return prev + 1;
			}
			// 输入错误，提示下一个输入
			if (!isShiftOnly(inputKeys)) {
				setIsInputError(true);
				inputAE.current!.incorrectAE.play();
				addShakeAnimation(hangulRef.current!);
			}
			return prev;
		});
	}, [inputKeys, qwerty, addShakeAnimation, inputAE]);

	const focusInput = useCallback(() => {
		inputRef.current.handleInputFocus?.();
	}, []);

	// biome-ignore lint/correctness/noUnusedVariables: <explanation>
	const blurInput = useCallback(() => {
		inputRef.current.handleInputBlur?.();
	}, []);

	const skipToNextWord = useCallback(
		(nextWordIndex: number) => {
			if (nextWordIndex >= dict.length) {
				setIsComplete(true);
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
		[focusInput, dict],
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

	/** 完成输入，下一个单词 放在useEffect可能有点问题, 仅curInputIndex更新时触发 */
	useEffect(() => {
		if (
			curInputIndex >= lastedHangul.current.length &&
			isEmptyInput(inputKeys)
		) {
			playConfetti();
			toNextWord();
		}
	}, [curInputIndex, lastedHangul, inputKeys, toNextWord]);

	const translation = useMemo(() => {
		if (!currentWord) return null;
		const trans =
			currentWord.trans[locale as keyof Tran] || currentWord.trans.en;
		return trans.join(", ");
	}, [currentWord, locale]);

	const exTranslation = useMemo(() => {
		if (!currentWord) return null;
		const exTrans =
			currentWord.exTrans?.[locale as keyof Tran] ||
			currentWord.exTrans?.en ||
			[];
		return exTrans.join(", ");
	}, [currentWord, locale]);

	/** just for log */
	useEffect(() => {
		if (!isEmptyInput(inputKeys)) {
			console.log("inputKeys:", inputKeys);
		}
	}, [inputKeys]);

	/** 输入状态 style */
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
		.space {${isSpace(keyCode) ? `fill: ${activeColor};` : ""}}
		.backspace {${isBackspace(keyCode) ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [inputKeys]);

	const highLightExample = (example?: string) => {
		const displayName = currentWord?.name || "";
		return reactStringReplace(example, displayName, (match, index) => (
			<b className={notoKR.className} key={index}>
				{match}
			</b>
		));
	};

	if (isComplete) {
		return (
			<Wrapper>
				<div className="flex flex-col items-center justify-center">
					<CompleteSVG />
					<RefreshSVG className="mt-5 cursor-pointer" onClick={resetWord} />
				</div>
			</Wrapper>
		);
	}

	return (
		<Wrapper>
			<DictNav
				onNext={toNextWord}
				onPrev={toPrevWord}
				dict={dict}
				curWordIndex={curWordIndex}
			/>
			<div className={clsx(notoKR.className, "text-4xl font-bold relative")}>
				{displayName}
				<div
					className="tooltip tooltip-right absolute top-1/2 -right-10 -translate-x-1/2 -translate-y-1/2"
					data-tip={`${romanized} / ${standardized}`}
				>
					<Pronunciation width={20} height={20} text={currentWord?.name} />
				</div>
			</div>
			<div className="text-lg text-gray-500 my-2">{translation}</div>
			{/* 韩语音节 */}
			<div
				className={clsx(
					notoKR.className,
					"relative inline-block cursor-pointer text-xl text-[color:var(--font-color-inactive)]",
				)}
				ref={hangulRef}
				onClick={focusInput}
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
				<div
					className="tooltip tooltip-right absolute -right-9 top-1/2 -translate-x-1/2 -translate-y-1/2"
					data-tip={qwerty}
				>
					<InfoIcon
						className="opacity-60"
						width={20}
						height={20}
						viewBox="0 0 24 24"
					/>
				</div>
			</div>
			<div className="hidden">
				{showKeyboard ? (
					<KeyboardIcon
						onClick={toggleShowKeyboard}
						className="cursor-pointer"
						width={28}
						height={28}
						fill="currentColor"
					/>
				) : (
					<ScoreIcon
						onClick={toggleShowKeyboard}
						className="cursor-pointer"
						width={28}
						height={28}
						fill="currentColor"
					/>
				)}
			</div>
			{/* 键盘图案 */}
			<div
				className={clsx(
					"drop-shadow-xl w-[80vw] my-2 rounded-md overflow-hidden relative",
					{
						invisible: !showKeyboard,
					},
				)}
			>
				<style>{inlineStyle}</style>
				<KoreanKeyBoardSVG
					viewBox="0 0 910 310"
					width={"100%"}
					height={"100%"}
					className="dark:invert-[0.8]"
				/>
				<div
					className={clsx(
						"transition-all select-none absolute top-0 left-0 w-full h-full bg-gray-400/75 dark:bg-gray-800/85 flex items-center justify-center flex-col",
						isInputFocused ? "opacity-0 pointer-events-none" : "opacity-100",
					)}
				>
					<div className="text-3xl flex items-center">
						{tHome.rich("tipsEnter", {
							enter: () => <kbd className="kbd kbd-md mx-2">Enter</kbd>,
						})}
					</div>
					<button
						className="btn btn-outline btn-sm mt-5 mb-2"
						type="button"
						onClick={() => drawerRef.current.open()}
					>
						{tHome("viewList")}
					</button>
					<div className="text-sm">
						tips: Try <kbd className="kbd kbd-xs">[</kbd>
						{" / "}
						<kbd className="kbd kbd-xs">]</kbd>.
					</div>
				</div>
			</div>
			{/* 例句 */}
			{currentWord?.example && (
				<div className="flex justify-center flex-col items-center">
					<p className={clsx("relative", myeongjo.className)}>
						{highLightExample(currentWord.example)}
						<Pronunciation
							width={12}
							height={12}
							text={currentWord.example}
							className="absolute top-1/2 -right-6 -translate-x-1/2 -translate-y-1/2"
						/>
					</p>
					<p>{exTranslation}</p>
				</div>
			)}
			{/* 键盘输入 */}
			<div className="hidden text-[color:var(--font-color-inactive)]">
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
			<HomeInput
				onFocusChange={setIsInputFocused}
				onInput={setInputKeys}
				position={inputPosition}
				ref={inputRef}
			/>
			<HomeDrawer
				drawerRef={drawerRef}
				dict={dict}
				curWordIndex={curWordIndex}
				onClick={skipToNextWord}
				onShuffle={shuffleDict}
			/>
		</Wrapper>
	);
};

const Wrapper = ({ children }: { children: ReactNode }) => (
	<div className={clsx("flex", "flex-col", "items-center", "justify-center")}>
		{children}
	</div>
);

export { HomeStatus };
