import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import { SearchButton } from "@/components/select-search-button";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import { debounce } from "lodash";
import { useLocale } from "next-intl";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { type Root, createRoot } from "react-dom/client";

const SuggestionPanel = dynamic(
	() =>
		import("@/components/select-to-suggestion").then(
			(mod) => mod.SuggestionPanel,
		),
	{
		ssr: false,
	},
);

const selectToSearch = (
	locale: string,
	{
		container = null,
		showAI = true,
		showCopy = true,
		showSearch = true,
	}: Config = {},
) => {
	const detectElement = container || document.body;

	let root: Root | null = null;
	const buttonContainer = document.createElement("div");
	document.body.appendChild(buttonContainer);

	const isKorean = (text: string) =>
		/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3000-\u303F\uFF00-\uFFEF\s]/.test(
			text,
		);

	const copyToClipboard = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	const openAISuggestion = async (text: string) => {
		const selection = window.getSelection();
		const range = selection?.getRangeAt(0);
		const rect = range?.getBoundingClientRect();
		if (!root || !rect) return;
		root.render(null);
		const promise = generateWordSuggestionAction(text, locale);
		// const promise = Promise.resolve("12324");
		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		const showAbove = spaceBelow < 200 && spaceAbove > spaceBelow;

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

	const openPapagoSearch = (selectedText: string) => {
		if (selectedText) {
			const papagoUrl = `https://papago.naver.com/?sk=ko&tk=${locale}&st=${encodeURIComponent(selectedText)}`;
			window.open(
				papagoUrl,
				"PapagoSearch",
				"width=400,height=600,left=150,top=150",
			);
		}
	};

	const showSearchButton = debounce(() => {
		const selection = window.getSelection();
		const selectedText = selection?.toString().trim();

		if (selectedText && isKorean(selectedText)) {
			const range = selection?.getRangeAt(0);
			const rect = range?.getBoundingClientRect();

			if (rect) {
				if (!root) {
					root = createRoot(buttonContainer);
				}

				root.render(
					<div
						style={{
							top: `${rect.bottom + window.scrollY}px`,
							left: `${rect.right + window.scrollX}px`,
						}}
						className="z-[1] border border-base-content/10 bg-white/10 shadow backdrop-blur-md flex absolute rounded overflow-hidden"
					>
						{showSearch && (
							<SearchButton
								onClick={() => openPapagoSearch(selectedText)}
								icon="search"
								title="search"
							/>
						)}
						{showCopy && (
							<SearchButton
								onClick={() => {
									copyToClipboard(selectedText);
									root?.render(null);
								}}
								icon="copy"
								title="copy"
							/>
						)}
						{showAI && (
							<SearchButton
								onClick={() => openAISuggestion(selectedText)}
								icon="sparkles"
								title="AI"
							/>
						)}
					</div>,
				);
			}
		} else if (root) {
			root.render(null);
		}
	}, 150);

	detectElement.addEventListener("mouseup", showSearchButton);

	return () => {
		detectElement.removeEventListener("mouseup", showSearchButton);
		if (root) {
			// Use requestAnimationFrame to ensure unmounting happens after the current render cycle
			requestAnimationFrame(() => {
				root?.unmount();
				root = null;
				buttonContainer.remove();
			});
		}
	};
};

type Config = {
	container?: HTMLElement | null;
	showCopy?: boolean;
	showSearch?: boolean;
	showAI?: boolean;
};

const useSelectToSearch = ({
	container = null,
	showCopy = true,
	showSearch = true,
	showAI = true,
}: Config = {}) => {
	const locale = useLocale();

	useEffect(() => {
		const cancel = selectToSearch(locale, {
			container,
			showCopy,
			showSearch,
			showAI,
		});
		return () => {
			cancel?.();
		};
	}, [locale, container, showCopy, showSearch, showAI]);
};

export { selectToSearch, useSelectToSearch };
