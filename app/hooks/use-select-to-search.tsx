"use client";
import { FloatButtonsPanel } from "@/components/float-buttons-panel";
import {
	generateSentenceSuggestionPrompt,
	generateWordSuggestionPrompt,
} from "@/utils/prompts";
import { useDebounceFn, useEventListener } from "ahooks";
import {
	type ComponentProps,
	type PropsWithChildren,
	type RefObject,
	useRef,
	useState,
} from "react";

const useSelectToSearch = ({
	showCopy = true,
	showSearch = true,
	showAI = true,
	showAdd = false,
	prompt,
}: Config = {}) => {
	const containerRef = useRef<HTMLElement>(null);
	const [selectedText, setSelectedText] = useState<string>("");
	const showPanel = !!selectedText;

	const isKorean = (text: string) =>
		/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3000-\u303F\uFF00-\uFFEF\s]/.test(
			text,
		);

	const { run: showSearchButton } = useDebounceFn(
		() => {
			const selection = window.getSelection();
			const selectedText = selection?.toString().trim();

			if (selectedText && isKorean(selectedText)) {
				const range = selection?.getRangeAt(0);
				if (range) {
					setSelectedText(selectedText);
				}
			} else {
				setSelectedText("");
			}
		},
		{ wait: 150 },
	);

	useEventListener("mouseup", showSearchButton, {
		target: containerRef,
	});
	const promptFn =
		prompt === "sentence"
			? generateSentenceSuggestionPrompt
			: prompt === "word"
				? generateWordSuggestionPrompt
				: prompt;

	const panel = showPanel ? (
		<FloatButtonsPanel
			getRect={() =>
				window.getSelection()!.getRangeAt(0).getBoundingClientRect()
			}
			selectedText={selectedText}
			showSearch={showSearch}
			showCopy={showCopy}
			showAI={showAI}
			showAdd={showAdd}
			prompt={promptFn}
			onClose={() => {
				setSelectedText("");
			}}
		/>
	) : null;

	return [containerRef, panel] as const;
};

type Config = {
	showCopy?: boolean;
	showSearch?: boolean;
	showAI?: boolean;
	showAdd?: boolean;
	prompt?:
		| ComponentProps<typeof FloatButtonsPanel>["prompt"]
		| "sentence"
		| "word";
};

const SelectToSearch = ({
	children,
	...config
}: PropsWithChildren<Parameters<typeof useSelectToSearch>[0]>) => {
	const [containerRef, panel] = useSelectToSearch({ ...config });
	return (
		<div ref={containerRef as RefObject<HTMLDivElement>}>
			{children}
			{panel}
		</div>
	);
};

export { useSelectToSearch, SelectToSearch };
