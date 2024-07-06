"use client";
import { SizedConfetti } from "@/components/sized-confetti";
import type { InputKeys } from "@/types";
// https://www.lexilogos.com/code/conkr.js
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import { convertInputsToQwerty } from "@/utils/convert-input";
import { myeongjo } from "@/utils/fonts";
import { hangulToQwerty } from "@/utils/kr-const";
import clsx from "clsx";
import {
	convertQwertyToHangul,
	convertQwertyToHangulAlphabet,
	disassembleHangul,
	disassembleHangulToGroups,
} from "es-hangul";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HomeStatus = ({
	dict,
	inputKeys,
}: { dict: Dict; inputKeys: InputKeys }) => {
	const [curWordIndex, setCurWordIndex] = useState(0);
	const [curInputIndex, setCurInputIndex] = useState(0);
	const locale = useLocale();
	const [confetti, setConfetti] = useState(false);

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

	return (
		<div className={clsx(myeongjo.className, "text-center")}>
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
			<div>
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
		</div>
	);
};

export { HomeStatus };
