"use client";
import { assemble } from "es-hangul";
import { useTranslations } from "next-intl";
import { ToolItem } from "./tool-item";

const Assemble = () => {
	const tTools = useTranslations("Tools");
	const props = {
		resolve: (inputText: string | number) =>
			String(inputText).length ? assemble(Array.from(String(inputText))) : "",
		defaultValue: "ㅅㅏㄹㅏㅇㅎㅐ",
		title: tTools("assemble"),
		description: tTools("assembleDescription"),
	};
	return <ToolItem {...props} />;
};

export { Assemble };
