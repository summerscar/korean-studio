"use client";
// https://www.lexilogos.com/code/conkr.js
import type { Dict } from "@/types/dict";
import type { Tran } from "@/types/dict";
import { hangulToQwerty } from "@/utils/kr-const";
import {
	convertQwertyToHangul,
	convertQwertyToHangulAlphabet,
	disassembleHangul,
	disassembleHangulToGroups,
} from "es-hangul";
import { useLocale } from "next-intl";
import { useMemo, useState } from "react";

const HomeStatus = ({ dict }: { dict: Dict }) => {
	const [curInputIndex] = useState(0);
	const locale = useLocale();

	const currentWord = useMemo(() => {
		if (curInputIndex < dict.length) {
			return dict[curInputIndex];
		}
		return null;
	}, [curInputIndex, dict]);

	const translation = useMemo(() => {
		if (!currentWord) return null;
		const trans = currentWord.trans[locale as keyof Tran] || currentWord.trans.en;
		return trans.join(", ");
	}, [currentWord, locale]);

	const displayName = currentWord?.name || "";
	const hangul = disassembleHangul(displayName);
	const qwerty = hangulToQwerty(hangul);
	return (
		<div className="text-center">
			<div className="text-4xl font-bold">{displayName}</div>
			<div className="text-lg text-gray-500">{translation}</div>
			<div>{hangul}</div>
			<div>{qwerty}</div>
		</div>
	);
};

export { HomeStatus };
