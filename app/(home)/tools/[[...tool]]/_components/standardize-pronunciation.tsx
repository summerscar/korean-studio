"use client";
import { standardizePronunciation } from "es-hangul";
import { useTranslations } from "next-intl";
import { ToolItem } from "./tool-item";

const StandardizePronunciation = () => {
	const tTools = useTranslations("Tools");

	const props = {
		resolve: (inputText: string | number) =>
			standardizePronunciation(String(inputText), { hardConversion: true }),
		defaultValue: "십니다",
		title: tTools("standardizePronunciation"),
		description: tTools("standardizePronunciationDescription"),
	};
	return <ToolItem {...props} />;
};

export { StandardizePronunciation };
