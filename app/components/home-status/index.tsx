"use client";
import CompleteSVG from "@/assets/svg/complete.svg";
import RefreshSVG from "@/assets/svg/refresh.svg";

import { useHomeProgress } from "@/components/header/_component/progress";
import { checkIsTouchable, useDevice } from "@/hooks/use-device";
import { usePronunciation } from "@/hooks/use-pronunciation";
import { type Dict, Dicts } from "@/types/dict";
import type { UserDicts } from "@/types/dict";
import type { SITES_LANGUAGE } from "@/types/site";
import { useInputAudioEffect } from "@/utils/audio";
import { playConfetti } from "@/utils/confetti";
import {
	NextKeyShortcut,
	PrevKeyShortcut,
	convertInputsToQwerty,
	isEmptyInput,
	isShiftOnly,
	parseSpaceStr,
	spaceStr,
} from "@/utils/convert-input";
import { isServer } from "@/utils/is-server";
import { hangulToQwerty } from "@/utils/kr-const";
import { getLocalDict } from "@/utils/local-dict";
import { shuffleArr } from "@/utils/shuffle-array";
import { useEventListener, useLatest, useMemoizedFn } from "ahooks";
import clsx from "clsx";
import { disassemble } from "es-hangul";
import { useLocale } from "next-intl";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { DictNav } from "./dict-nav";
import { DisplayName } from "./display-name";
import {
	DynamicDrawer as HomeDrawer,
	DynamicWordCards as WordCards,
} from "./dynamic-comp";
import { Hangul } from "./hangul";
import { HomeInput } from "./input";
import { KeyBoard } from "./keyboard";
import { ModeToggle } from "./mode-toggle";
import { useDictTheme } from "./use-dict-theme";
import { useHomeSetting } from "./use-home-setting";
import { useNewNotification } from "./use-new-notification";
import { WordExample } from "./word-example";
import { WordMeaning } from "./word-meaning";

const HomeStatus = ({
	isLocalDict,
	isUserDict,
	dictList,
	dict: originalDict,
	dictId,
}: {
	isLocalDict: boolean;
	isUserDict: boolean;
	dictList: UserDicts;
	dict: Dict;
	dictId: string;
}) => {
	const [dict, setDict] = useState(originalDict);
	const [isInputMode, setIsInputMode] = useState(true);
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [isInputError, setIsInputError] = useState(false);
	const [isInputFocused, setIsInputFocused] = useState(false);
	const playExampleRef = useRef(() => {});
	const slideToIndexRef = useRef<(index: number) => void>(() => {});
	const { isTouchable } = useDevice();
	useEffect(() => {
		if (isTouchable) {
			setIsInputMode(false);
		}
	}, [isTouchable]);
	useNewNotification(dictId);
	useDictTheme(dictList.find((dict) => dict.id === dictId));
	const { setting, onSettingChange, setSetting } = useHomeSetting();

	const inputAE = useInputAudioEffect(setting.enableAudio);

	const drawerRef = useRef({ open: () => {} });
	const locale = useLocale() as SITES_LANGUAGE;
	const hangulRef = useRef<HTMLDivElement>(null);
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});
	const inputRef = useRef({
		handleInputBlur: () => {},
		handleInputFocus: () => {},
	});

	const setDictAndDisableVoice = useMemoizedFn(
		(dict: Parameters<typeof setDict>[0]) => {
			// 切换字典时 autoVoice 置为 false
			setSetting((prevSetting) => {
				prevSetting.autoVoice &&
					setTimeout(() => {
						setSetting(prevSetting);
					}, 300);
				return { ...prevSetting, autoVoice: false };
			});

			setDict(dict);
			if (curWordIndex >= dict.length) {
				skipToNextWord(dict.length - 1);
			}
		},
	);

	const setLocalDict = useMemoizedFn(() => {
		const localDict = getLocalDict();
		setDictAndDisableVoice(localDict);
	});

	useEffect(() => {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get("dict") === Dicts.local) {
			setLocalDict();
			return;
		}
		setDictAndDisableVoice(originalDict);
	}, [originalDict, setLocalDict, setDictAndDisableVoice]);

	const shuffleDict = useMemoizedFn(() => {
		setDictAndDisableVoice((prev) => shuffleArr(prev));
	});

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		resetWord();
	}, [dictId]);

	useEventListener(
		"keyup",
		(e) => {
			/** 进入输入状态 */
			if (e.code === "Enter") {
				if (isInputFocused || isComplete) return;
				focusInput();
				return;
			}
			if (e.code === "Backslash") {
				onSettingChange({ showMeaning: !setting.showMeaning });
				return;
			}
			if (e.code === "Semicolon") {
				playWord();
				return;
			}
			if (e.code === "Quote") {
				playExampleRef.current();
				return;
			}
			/** 单词导航 */
			if ([NextKeyShortcut, PrevKeyShortcut].includes(e.code)) {
				if (isComplete || (curWordIndex === 0 && e.code === PrevKeyShortcut))
					return;

				if (e.code === NextKeyShortcut) {
					toNextWordWithCheck();
					slideToIndexRef.current(Math.min(curWordIndex + 1, dict.length - 1));
				} else if (e.code === PrevKeyShortcut) {
					toPrevWord();
					slideToIndexRef.current(Math.max(curWordIndex - 1, 0));
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
	}, [curInputIndex, curWordIndex, dict]);

	const currentWord = useMemo(() => {
		if (curWordIndex < dict.length) {
			return dict[curWordIndex];
		}
		return null;
	}, [curWordIndex, dict]);

	const { isPlaying: isWordPlaying, play: playWord } = usePronunciation(
		currentWord?.name,
		{ autoPlay: setting.autoVoice },
	);

	/** 韩文字母 */
	const hangul = parseSpaceStr(disassemble(currentWord?.name || ""));
	const lastedHangul = useLatest(hangul);

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

	const focusInput = useMemoizedFn(() => {
		if (isTouchable || checkIsTouchable()) return;
		inputRef.current?.handleInputFocus?.();
	});

	// biome-ignore lint/correctness/noUnusedVariables: <explanation>
	const blurInput = useCallback(() => {
		inputRef.current.handleInputBlur?.();
	}, []);

	const skipToNextWord = useMemoizedFn((nextWordIndex: number) => {
		if (!dict.length) return;
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
		setInputKeys({});

		console.log(
			`skip to next word! ${targetIndex + 1}/${dict.length}  \n`,
			dict[targetIndex],
		);
	});

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

	useHomeProgress(!dict.length ? 0 : Math.min(1, curWordIndex / dict.length));

	/** 完成输入，下一个单词 放在useEffect可能有点问题, 仅curInputIndex更新时触发 */
	useEffect(() => {
		if (
			curInputIndex > 0 &&
			curInputIndex >= lastedHangul.current.length &&
			isEmptyInput(inputKeys)
		) {
			playConfetti();
			toNextWord();
		}
	}, [curInputIndex, lastedHangul, inputKeys, toNextWord]);

	/** just for log */
	useEffect(() => {
		if (!isEmptyInput(inputKeys)) {
			console.log("inputKeys:", inputKeys);
		}
	}, [inputKeys]);

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
		<Wrapper className={clsx(isInputMode && "mobile:px-[8vw]")}>
			{isInputMode ? (
				<>
					<DictNav
						onNext={toNextWord}
						onPrev={toPrevWord}
						dict={dict}
						curWordIndex={curWordIndex}
						hideMeaning={!setting.showMeaning}
					/>
					<DisplayName
						currentWord={currentWord}
						playWord={playWord}
						isWordPlaying={isWordPlaying}
						isLocalDict={isLocalDict}
					/>
					<WordMeaning
						showMeaning={setting.showMeaning}
						additionalMeaning={setting.additionalMeaning}
						currentWord={currentWord}
						locale={locale}
					/>
					{/* 韩语音节 */}
					<Hangul
						hangulRef={hangulRef}
						focusInput={focusInput}
						isInputError={isInputError}
						curInputIndex={curInputIndex}
						hangul={hangul}
						qwerty={qwerty}
					/>
					{/* 键盘图案 */}
					<KeyBoard
						inputKeys={inputKeys}
						isInputFocused={isInputFocused}
						drawerRef={drawerRef}
					/>
					{/* 例句 */}
					<WordExample
						currentWord={currentWord}
						playRef={playExampleRef}
						showMeaning={setting.showMeaning}
						additionalMeaning={setting.additionalMeaning}
						locale={locale}
					/>
					{qwerty && (
						<HomeInput
							onFocusChange={setIsInputFocused}
							onInput={setInputKeys}
							position={inputPosition}
							ref={inputRef}
						/>
					)}
					<HomeDrawer
						isLocalDict={isLocalDict}
						isUserDict={isUserDict}
						dictList={dictList}
						dictId={dictId}
						drawerRef={drawerRef}
						dict={dict}
						curWordIndex={curWordIndex}
						onClick={skipToNextWord}
						onShuffle={shuffleDict}
						onLocalDictUpdate={setLocalDict}
						setting={setting}
						onSettingChange={onSettingChange}
					/>
				</>
			) : (
				<WordCards
					dict={dict}
					curWordIndex={curWordIndex}
					onChange={skipToNextWord}
					playWord={playWord}
					isWordPlaying={isWordPlaying}
					additionalMeaning={setting.additionalMeaning}
					showMeaning={setting.showMeaning}
					locale={locale}
					isLocalDict={isLocalDict}
					playExampleRef={playExampleRef}
					slideToIndexRef={slideToIndexRef}
				/>
			)}
			<ModeToggle isInputMode={isInputMode} onChange={setIsInputMode} />
		</Wrapper>
	);
};

const Wrapper = ({
	children,
	className,
}: { children: ReactNode; className?: string }) => {
	return (
		<div
			className={clsx(
				"flex flex-col items-center justify-center w-full",
				className,
			)}
		>
			{children}
		</div>
	);
};

export { HomeStatus };
