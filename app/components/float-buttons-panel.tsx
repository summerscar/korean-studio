import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import { SearchButton } from "@/components/select-search-button";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import type { SITES_LANGUAGE } from "@/types/site";
import { timeOut } from "@/utils/time-out";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { useRef } from "react";
import type { Root } from "react-dom/client";

const SuggestionPanel = dynamic(
	() =>
		import("@/components/select-to-suggestion").then(
			(mod) => mod.SuggestionPanel,
		),
	{
		ssr: false,
		loading: () => <span className="loading loading-ring loading-lg" />,
	},
);

interface FloatButtonsPanelProps {
	getRect: () => DOMRect;
	selectedText: string;
	showSearch?: boolean;
	showCopy?: boolean;
	showAI?: boolean;
	root: Root;
	locale: SITES_LANGUAGE;
	position?: "top" | "bottom";
	onClose?: () => void;
	prompt?: (word: string, locale: SITES_LANGUAGE) => string;
}

export function FloatButtonsPanel({
	getRect,
	selectedText,
	showSearch = true,
	showCopy = true,
	showAI = true,
	onClose,
	root,
	locale,
	position = "bottom",
	prompt,
}: FloatButtonsPanelProps) {
	const observerRef = useRef<ResizeObserver>(null);

	// 劫持 render， 清理 observer
	const originalRender = root.render;
	function newRender(this: Root, ...args: Parameters<typeof root.render>) {
		if (observerRef.current && args[0] === null) {
			observerRef.current.disconnect();
			observerRef.current = null;
			this.render = originalRender;
		}
		const res = originalRender.call(this, ...args);
		return res;
	}
	newRender.__ = true;
	if (!(originalRender as unknown as { __: boolean }).__) {
		root.render = newRender;
	}

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(selectedText);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		} finally {
			onClose?.();
		}
	};

	const onPapagoSearch = () => {
		if (selectedText) {
			const papagoUrl = `https://papago.naver.com/?sk=ko&tk=${locale}&st=${encodeURIComponent(selectedText)}`;
			window.open(
				papagoUrl,
				"PapagoSearch",
				"width=400,height=600,left=150,top=150",
			);
		}
		onClose?.();
	};

	const openAISuggestion = async () => {
		if (!root || !prompt) return;
		// 防止同步render后影响外面的 clickOutside 检测
		await timeOut(0);
		onClose?.();
		const promise = generateWordSuggestionAction(prompt(selectedText, locale));
		// const promise = Promise.resolve("123");
		const windowHeight = window.innerHeight;
		const rect = getRect();
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		const showAbove = spaceBelow < 300 && spaceAbove > spaceBelow;

		observerRef.current = new ResizeObserver((entries) => {
			const el = entries[0].target as HTMLDivElement;
			const { height } = el.getBoundingClientRect();
			if (showAbove) {
				el.style.top = `${rect.top - height + window.scrollY}px`;
			}
		});

		root.render(
			<div
				ref={(el) => {
					if (el) {
						observerRef.current?.observe(el);
					}
				}}
				style={{
					top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
					left: 0,
					right: 0,
				}}
				className="z-[1] absolute flex justify-center pointer-events-none"
			>
				<div
					className={`flex backdrop-blur-md rounded-lg w-4/5 sm:w-[600px] min-h-40 max-h-96 sm:max-h-[65vh] p-2 sm:p-4 justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
				>
					<ErrorBoundary errorComponent={ErrorFallback}>
						<SuggestionPanel promise={promise} />
					</ErrorBoundary>
				</div>
			</div>,
		);
	};

	const rect = getRect();
	return (
		<div
			style={{
				...(position === "top"
					? { top: `${rect.top - 35 + window.scrollY}px` }
					: { top: `${rect.bottom + window.scrollY}px` }),
				left: `${rect.right - rect.width / 2 + window.scrollX}px`,
			}}
			className="z-[1] border border-base-content/10 bg-white/10 shadow backdrop-blur-md flex absolute rounded overflow-hidden -translate-x-1/4"
		>
			{showSearch && <SearchButton onClick={onPapagoSearch} icon="search" />}
			{showCopy && <SearchButton onClick={onCopy} icon="copy" />}
			{showAI && prompt && (
				<SearchButton onClick={openAISuggestion} icon="sparkles" />
			)}
		</div>
	);
}
