"use client";
import { disassemble } from "es-hangul";
import { useTranslations } from "next-intl";
import { ToolItem } from "./tool-item";

const Disassemble = () => {
	const tTools = useTranslations("Tools");

	const props = {
		resolve: (inputText: string | number) => disassemble(String(inputText)),
		defaultValue: "사랑해",
		title: tTools("disassemble"),
		description: tTools("disassembleDescription"),
	};
	return <ToolItem {...props} />;
};

export { Disassemble };
