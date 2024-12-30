"use client";
import { FloatButtonsPanel } from "@/components/float-buttons-panel";
import { isKorean } from "@/utils/is-korean";
import {
	generateSentenceSuggestionPrompt,
	generateWordSuggestionPrompt,
} from "@/utils/prompts";
import { useClickAway, useDebounceFn, useEventListener } from "ahooks";
import {
	type ComponentProps,
	type PropsWithChildren,
	type RefObject,
	useRef,
	useState,
} from "react";

const useSelectToSearch = ({
	showCopy = true,
	showTranslate = true,
	showAI = true,
	showAdd = false,
	showAnnotate = false,
	clickAway = true,
	prompt,
}: Config = {}) => {
	const containerRef = useRef<HTMLElement>(null);
	const [selectedText, setSelectedText] = useState<string>("");
	const showPanel = !!selectedText;

	const { run: showFloatButton } = useDebounceFn(
		(e: MouseEvent) => {
			if (!containerRef.current?.contains(e.target as Node)) return;
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

	useEventListener("mouseup", showFloatButton, {
		target: containerRef,
	});

	useClickAway((e) => {
		if (!clickAway) return;

		if ((e.target as HTMLElement).closest("[data-ignore-click-away]")) return;

		setSelectedText("");
	}, containerRef);

	const promptFn =
		prompt === "sentence"
			? generateSentenceSuggestionPrompt
			: prompt === "word"
				? generateWordSuggestionPrompt
				: prompt;

	const shouldShowAnnotate = () => {
		const range = window.getSelection()?.getRangeAt(0);
		// 防止注释、单词高亮重合
		return (
			showAnnotate &&
			!!range &&
			!!range.toString().trim() &&
			// 同一个文本节点
			range.startContainer === range.endContainer &&
			// 不是 span 内的文本
			range.commonAncestorContainer.parentElement?.tagName !== "SPAN"
		);
	};

	const panel = showPanel ? (
		<FloatButtonsPanel
			getRect={() =>
				window.getSelection()!.getRangeAt(0).getBoundingClientRect()
			}
			selectedText={selectedText}
			showTranslate={showTranslate}
			showCopy={showCopy}
			showAI={showAI}
			showAdd={showAdd}
			showAnnotate={shouldShowAnnotate()}
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
	showTranslate?: boolean;
	showAI?: boolean;
	showAdd?: boolean;
	clickAway?: boolean;
	showAnnotate?: boolean;
	prompt?:
		| ComponentProps<typeof FloatButtonsPanel>["prompt"]
		| "sentence"
		| "word";
};

const SelectToSearch = ({
	children,
	className,
	...config
}: PropsWithChildren<Parameters<typeof useSelectToSearch>[0]> & {
	className?: string;
}) => {
	const [containerRef, panel] = useSelectToSearch({ ...config });
	return (
		<div ref={containerRef as RefObject<HTMLDivElement>} className={className}>
			{children}
			{panel}
		</div>
	);
};

export { useSelectToSearch, SelectToSearch };
