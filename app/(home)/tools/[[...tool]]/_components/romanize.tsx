"use client";
import { romanize } from "es-hangul";
import { useTranslations } from "next-intl";
import { ToolItem } from "./tool-item";

const Romanized = () => {
	const tTools = useTranslations("Tools");

	const props = {
		resolve: (inputText: string | number) => romanize(String(inputText)),
		defaultValue: "사랑해",
		title: tTools("romanize"),
		description: tTools("romanizeDescription"),
	};
	return <ToolItem {...props} />;
};

export { Romanized };
