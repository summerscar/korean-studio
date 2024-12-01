"use client";
import CompleteSVG from "@/assets/svg/complete.svg";
import InfoIcon from "@/assets/svg/info.svg";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import RefreshSVG from "@/assets/svg/refresh.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import SpeakerIcon from "@/assets/svg/speaker.svg";
import { useHomeProgress } from "@/components/header/_component/progress";
import { HideText } from "@/components/hide-text";
import { HomeDrawer } from "@/components/home-drawer";
import { Pronunciation } from "@/components/pronunciation";
import { checkIsTouchable, useDevice } from "@/hooks/use-device";
import { useHoverToSearch } from "@/hooks/use-hover-to-search";
import { usePronunciation } from "@/hooks/use-pronunciation";
import type { HomeSetting } from "@/types";
import { type Dict, Dicts } from "@/types/dict";
import type { UserDicts } from "@/types/dict";
import { SITES_LANGUAGE } from "@/types/site";
import { useInputAudioEffect } from "@/utils/audio";
import { playConfetti } from "@/utils/confetti";
import { HOME_SETTING_KEY } from "@/utils/config";
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
import { notoKR } from "@/utils/fonts";
import { isServer } from "@/utils/is-server";
import { hangulToQwerty } from "@/utils/kr-const";
import { getLocalDict } from "@/utils/local-dict";
import { shuffleArr } from "@/utils/shuffle-array";
import { useEventListener, useLatest, useMemoizedFn, useMount } from "ahooks";
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
import { DictNav } from "./dict-nav";
import { HomeInput } from "./input";
import { Star } from "./star";
import { useNewNotification } from "./use-new-notification";

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
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const [isComplete, setIsComplete] = useState(false);
	const [isInputError, setIsInputError] = useState(false);
	const [isInputFocused, setIsInputFocused] = useState(false);
	const playExampleRef = useRef(() => {});
	const { isTouchable } = useDevice();
	useNewNotification(dictId);
	const [setting, setSetting] = useState<HomeSetting>({
		autoVoice: false,
		showMeaning: true,
		enableAudio: true,
		additionalMeaning: false,
	});
	useMount(() => {
		const settingStr = localStorage.getItem(HOME_SETTING_KEY);
		if (settingStr) {
			const newSetting = JSON.parse(settingStr);
			setSetting(newSetting);
		}
	});

	const onSettingChange = (newVal: Partial<typeof setting>) => {
		setSetting((val) => {
			const newSetting = { ...val, ...newVal };
			localStorage.setItem(HOME_SETTING_KEY, JSON.stringify(newSetting));
			return newSetting;
		});
	};

	const inputAE = useInputAudioEffect(setting.enableAudio);

	const drawerRef = useRef({ open: () => {} });
	const locale = useLocale() as SITES_LANGUAGE;
	const tHome = useTranslations("Home");
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
	}, [curInputIndex, curWordIndex, dict]);

	const currentWord = useMemo(() => {
		if (curWordIndex < dict.length) {
			return dict[curWordIndex];
		}
		return null;
	}, [curWordIndex, dict]);

	const displayNameRef = useHoverToSearch(currentWord?.name);
	const exampleRef = useHoverToSearch(currentWord?.example);

	const { isPlaying: isWordPlaying, play: playWord } = usePronunciation(
		currentWord?.name,
		{ autoPlay: setting.autoVoice },
	);
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

	const wordTranslations = useMemo(() => {
		if (!currentWord) return null;
		return Object.entries(currentWord.trans).reduce(
			(prev, [key, tran]) => {
				return Object.assign(prev, { [key]: tran.join(", ") });
			},
			{} as Record<SITES_LANGUAGE, string>,
		);
	}, [currentWord]);

	const exTranslations = useMemo(() => {
		if (!currentWord) return null;
		return Object.entries(currentWord.exTrans || {}).reduce(
			(prev, [key, tran]) => {
				return Object.assign(prev, { [key]: tran.join(", ") });
			},
			{} as Record<SITES_LANGUAGE, string>,
		);
	}, [currentWord]);

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
			"text-[color:var(--font-color-active)] font-bold":
				curInputIndex > strIndex,
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
				hideMeaning={!setting.showMeaning}
			/>
			{displayName && (
				<div
					className={clsx(
						notoKR.className,
						"text-4xl font-bold relative mobile:mt-8",
					)}
				>
					<span ref={displayNameRef}>{displayName}</span>
					<div
						className={clsx(
							"flex absolute top-1/2 -right-10 -translate-x-1/2 -translate-y-[90%] z-[1]",
							!isTouchable && "tooltip tooltip-top",
						)}
						data-tip={`${romanized} [${standardized}]`}
					>
						<SpeakerIcon
							width={20}
							height={20}
							onMouseEnter={playWord}
							onTouchEnd={playWord}
							className={clsx(
								isWordPlaying ? "fill-current" : "text-base-content",
								"cursor-pointer inline-block",
							)}
						/>
					</div>
					<Star dictItem={currentWord} isLocalDict={isLocalDict} />
				</div>
			)}
			<div className="text-lg text-gray-500 mt-3 mb-2">
				<HideText hide={!setting.showMeaning}>
					{wordTranslations?.[locale] || wordTranslations?.en}
				</HideText>
			</div>
			{/* 额外翻译 */}
			{setting.additionalMeaning && (
				<HideText
					hide={!setting.showMeaning}
					className="mb-3 -mt-1.5 block mobile:max-w-[90vw]"
				>
					<div className="flex flex-row gap-3">
						{Object.values(SITES_LANGUAGE)
							.filter((lang) => lang !== locale)
							.map((lang) => (
								<span
									key={lang}
									data-lang={lang}
									className="text-xs text-gray-500/80 text-center"
								>
									{wordTranslations?.[lang] || wordTranslations?.en}
								</span>
							))}
					</div>
				</HideText>
			)}
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
				{qwerty && (
					<div
						className={clsx(
							"absolute -right-9 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]",
							!isTouchable && "tooltip tooltip-top",
						)}
						data-tip={qwerty}
					>
						<InfoIcon
							className="opacity-60"
							width={20}
							height={20}
							viewBox="0 0 24 24"
						/>
					</div>
				)}
			</div>
			{/* 键盘图案 */}
			<div
				className={clsx(
					"drop-shadow-xl w-[90vw] sm:w-[80vw] md:w-[70vw] my-3 rounded-md sm:rounded-xl overflow-hidden relative",
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
					{!isTouchable ? (
						<div className="text-3xl flex items-center">
							{tHome.rich("tipsEnter", {
								enter: () => <kbd className="kbd kbd-md mx-2">Enter</kbd>,
							})}
						</div>
					) : (
						<div className="text-xl flex items-center text-center">
							{tHome("tipsForMobile")}
						</div>
					)}
					<button
						className="btn btn-outline btn-sm mt-5 mb-2"
						type="button"
						onClick={() => drawerRef.current.open()}
					>
						<SettingIcon className="size-5" />
						{tHome("viewList")}
					</button>
					{!isTouchable && (
						<div className="text-sm">
							tips: Try <kbd className="kbd kbd-xs">[</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">]</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">\</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">;</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">'</kbd>.
						</div>
					)}
				</div>
			</div>
			{/* 例句 */}
			{currentWord?.example && (
				<div className="flex justify-center flex-col items-center">
					<p className={clsx("relative", notoKR.className)}>
						<span ref={exampleRef}>
							{highLightExample(currentWord.example)}
						</span>
						<Pronunciation
							playRef={playExampleRef}
							width={12}
							height={12}
							text={currentWord.example}
							className="absolute top-1/2 -right-6 -translate-x-1/2 -translate-y-1/2"
						/>
					</p>
					<p>
						<HideText hide={!setting.showMeaning}>
							{exTranslations?.[locale] || exTranslations?.en}
						</HideText>
					</p>
					{/* 额外例句翻译 */}
					{setting.additionalMeaning && (
						<div className="flex text-center flex-col gap-0.5 py-0.5">
							{Object.values(SITES_LANGUAGE)
								.filter((lang) => lang !== locale)
								.map((lang) => (
									<div
										key={lang}
										data-lang={lang}
										className="text-xs text-base-content/80"
									>
										<HideText hide={!setting.showMeaning}>
											{exTranslations?.[lang] || exTranslations?.en}
										</HideText>
									</div>
								))}
						</div>
					)}
				</div>
			)}
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
		</Wrapper>
	);
};

const Wrapper = ({ children }: { children: ReactNode }) => {
	return (
		<div className={clsx("flex", "flex-col", "items-center", "justify-center")}>
			{children}
		</div>
	);
};

export { HomeStatus };
