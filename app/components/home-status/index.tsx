"use client";
import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import { SizedConfetti } from "@/components/sized-confetti";
import type { InputKeys } from "@/types";
// https://www.lexilogos.com/code/conkr.js
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import {
	convertInputsToQwerty,
	isShift,
	keyCodeToQwerty,
} from "@/utils/convert-input";
import { myeongjo } from "@/utils/fonts";
import { hangulToQwerty } from "@/utils/kr-const";
import { useClickAway } from "ahooks";
import clsx from "clsx";
import {
	convertQwertyToHangul,
	convertQwertyToHangulAlphabet,
	disassembleHangul,
	disassembleHangulToGroups,
} from "es-hangul";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HomeInput } from "../home-input";

const HomeStatus = ({
	dict,
}: {
	dict: Dict;
}) => {
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const locale = useLocale();
	const [confetti, setConfetti] = useState(false);
	const hangulRef = useRef<HTMLDivElement>(null);
	const [inputKeys, setInputKeys] = useState<Record<string, boolean>>({});
	const inputRef = useRef({
		handleInputBlur: () => {},
		handleInputFocus: () => {},
	});

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

	useEffect(() => {
		const keysList = Object.keys(inputKeys);
		if (!keysList.length) return;

		setCurInputIndex((prev) => {
			const targetKey = (qwerty || "").substring(prev, prev + 1);
			if (!targetKey) return prev;

			const isTarget = convertInputsToQwerty(inputKeys).find(
				(key) => key === targetKey,
			);
			if (isTarget) {
				return prev + 1;
			}
			// TODO: show tips
			return prev;
		});
	}, [inputKeys, qwerty]);

	const toNextWord = useCallback(() => {
		setCurWordIndex((val) => val + 1);
		setCurInputIndex(0);
		console.log("next word!");
	}, []);

	/** 完成输入，下一个单词 */
	useEffect(() => {
		if (curInputIndex >= hangul.length) {
			setConfetti(true);
			toNextWord();
		}
	}, [curInputIndex, hangul, toNextWord]);

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
			"text-red-500": curInputIndex > strIndex,
		});

	const inlineStyle = useMemo(() => {
		const activeColor = "var(--keyboard-active-color)";
		return Object.keys(inputKeys).reduce((prev, keyCode) => {
			return `${prev}.${keyCodeToQwerty(keyCode)} {fill: ${activeColor};}
		.shift {${isShift(keyCode) ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [inputKeys]);

	return (
		<div className={clsx(myeongjo.className, "text-center relative")}>
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
				className="inline-block"
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
			<HomeInput onInput={setInputKeys} ref={inputRef} />
		</div>
	);
};

export { HomeStatus };
