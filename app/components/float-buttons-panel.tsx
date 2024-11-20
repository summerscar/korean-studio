import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import { SearchButton } from "@/components/select-search-button";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import { timeOut } from "@/utils/time-out";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import type { Root } from "react-dom/client";

const SuggestionPanel = dynamic(
	() =>
		import("@/components/select-to-suggestion").then(
			(mod) => mod.SuggestionPanel,
		),
	{
		ssr: false,
	},
);

interface FloatButtonsPanelProps {
	rect: DOMRect;
	selectedText: string;
	showSearch?: boolean;
	showCopy?: boolean;
	showAI?: boolean;
	root: Root | null;
	locale: string;
	position?: "top" | "bottom";
	onClose?: () => void;
}

export function FloatButtonsPanel({
	rect,
	selectedText,
	showSearch = true,
	showCopy = true,
	showAI = true,
	onClose,
	root,
	locale,
	position = "bottom",
}: FloatButtonsPanelProps) {
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
		if (!root || !rect) return;
		// 防止同步render后影响外面的 clickOutside 检测
		await timeOut(0);
		onClose?.();
		const promise = generateWordSuggestionAction(selectedText, locale);
		// const promise = Promise.resolve("123");
		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		const showAbove = spaceBelow < 300 && spaceAbove > spaceBelow;

		root.render(
			<div
				style={{
					[showAbove ? "bottom" : "top"]:
						`${showAbove ? windowHeight - rect.top + window.scrollY : rect.bottom + window.scrollY}px`,
					left: 0,
					right: 0,
				}}
				className="z-[1] absolute flex justify-center pointer-events-none"
			>
				<div
					className={`flex backdrop-blur-md rounded w-4/5 sm:w-[600px] min-h-40 max-h-96 sm:max-h-[65vh] p-2 sm:p-4 justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
				>
					<ErrorBoundary errorComponent={ErrorFallback}>
						<Suspense
							fallback={<span className="loading loading-ring loading-lg" />}
						>
							<SuggestionPanel promise={promise} />
						</Suspense>
					</ErrorBoundary>
				</div>
			</div>,
		);
	};

	return (
		<div
			style={{
				...(position === "top"
					? { top: `${rect.top - 35 + window.scrollY}px` }
					: { top: `${rect.bottom + window.scrollY}px` }),
				left: `${rect.right - rect.width / 2 + window.scrollX}px`,
			}}
			className="z-[1] border border-base-content/10 bg-white/10 shadow backdrop-blur-md flex absolute rounded overflow-hidden"
		>
			{showSearch && (
				<SearchButton onClick={onPapagoSearch} icon="search" title="search" />
			)}
			{showCopy && <SearchButton onClick={onCopy} icon="copy" title="copy" />}
			{showAI && (
				<SearchButton onClick={openAISuggestion} icon="sparkles" title="AI" />
			)}
		</div>
	);
}
