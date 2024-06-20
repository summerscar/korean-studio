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
	return (
		<div className="text-center">
			<div>{displayName}</div>
			<div>{hangul}</div>
			<div>{hangulToQwerty(hangul)}</div>
			<div>{convertQwertyToHangul(hangulToQwerty(hangul))}</div>
			<div>{translation}</div>
		</div>
	);
};

export { HomeStatus };
