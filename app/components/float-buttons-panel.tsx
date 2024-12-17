"use client";
import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { SearchButton } from "@/components/select-search-button";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import { useUserDictList } from "@/hooks/use-dict-list";
import {
	createErrorToast,
	createLoadingToast,
	createSuccessToast,
} from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { SITES_LANGUAGE } from "@/types/site";
import { timeOut } from "@/utils/time-out";
import { useMemoizedFn } from "ahooks";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { callModal } from "./modal";

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
	showAdd?: boolean;
	position?: "top" | "bottom";
	onClose?: () => void;
	prompt?: (word: string, locale: SITES_LANGUAGE) => string;
	ref?: React.RefObject<HTMLDivElement | null>;
	onAIPanel?: () => void;
}

export function FloatButtonsPanel({
	getRect,
	selectedText,
	showSearch = true,
	showCopy = true,
	showAI = true,
	showAdd = false,
	onClose,
	onAIPanel,
	position = "bottom",
	prompt,
	ref,
}: FloatButtonsPanelProps) {
	const locale = useLocale() as SITES_LANGUAGE;
	const translate = useTranslations();
	const observerRef = useRef<ResizeObserver>(null);
	const { isLogin } = useUser();
	const dictList = useUserDictList({ filterFav: true });
	const [showAIPanel, setShowAI] = useState(false);
	const memoedGetRect = useMemoizedFn(getRect);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const rect = useMemo(() => {
		return memoedGetRect();
	}, [memoedGetRect, showAIPanel]);

	const onAdd = useMemoizedFn(async () => {
		onClose?.();
		if (!isLogin) {
			signIn();
			return;
		}
		if (selectedText) {
			const dictId = (await callModal({
				type: "select",
				title: "Select Dict to add",
				options: dictList.map((dict) => ({
					value: dict.id,
					label: dict.name,
				})),
			})) as string;
			if (!dictId) return;
			const word = selectedText.trim();
			const removeInfoToast = createLoadingToast(translate("Home.generating"));

			try {
				await addWordsToUserDictAction(dictId, [word]);
				createSuccessToast(translate("Home.generated"));
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} catch (error: any) {
				console.error(`[createWord][${word}]:\n`, error);
				createErrorToast(translate("Home.generateError"));
			} finally {
				removeInfoToast();
			}
		}
	});

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
		if (!prompt) return;
		await timeOut(16);
		setShowAI(true);
		onAIPanel?.();
	};

	const showAbove = useMemo(() => {
		if (!showAI) return false;

		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		const showAbove = spaceBelow < 300 && spaceAbove > spaceBelow;
		return showAbove;
	}, [showAI, rect]);

	useEffect(() => {
		if (showAIPanel) {
			observerRef.current = new ResizeObserver((entries) => {
				const el = entries[0].target as HTMLDivElement;
				const { height } = el.getBoundingClientRect();
				if (showAbove) {
					el.style.top = `${rect.top - height + window.scrollY}px`;
				}
			});
			return () => {
				observerRef.current?.disconnect();
			};
		}
	}, [showAIPanel, showAbove, rect]);

	// 只需要在 showAIPanel 时，渲染一次
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const panel = useMemo(
		() => (
			<div ref={ref} data-ignore-click-away="true">
				{showAIPanel ? (
					<AIPanel
						observerRef={observerRef}
						// promise={Promise.resolve("12345")}
						promise={generateWordSuggestionAction(
							prompt!(selectedText, locale),
						)}
						rect={rect}
						showAbove={showAbove}
					/>
				) : (
					<div
						style={{
							...(position === "top"
								? { top: `${rect.top - 35 + window.scrollY}px` }
								: { top: `${rect.bottom + window.scrollY}px` }),
							left: `${rect.right - rect.width / 2 + window.scrollX}px`,
						}}
						className="z-[1] border border-base-content/10 bg-white/10 shadow backdrop-blur-md flex absolute rounded overflow-hidden -translate-x-1/4"
					>
						{showAdd && <SearchButton onClick={onAdd} icon="add" />}
						{showSearch && (
							<SearchButton onClick={onPapagoSearch} icon="search" />
						)}
						{showCopy && <SearchButton onClick={onCopy} icon="copy" />}
						{showAI && prompt && (
							<SearchButton onClick={openAISuggestion} icon="sparkles" />
						)}
					</div>
				)}
			</div>
		),
		[showAIPanel],
	);

	return createPortal(panel, document.body);
}

const AIPanel = ({
	observerRef,
	showAbove,
	rect,
	promise,
}: {
	observerRef: React.RefObject<ResizeObserver | null>;
	ref?: React.RefObject<HTMLDivElement>;
	showAbove: boolean;
	rect: DOMRect;
	promise: Promise<string>;
}) => {
	return (
		<div
			ref={(el) => {
				if (el) {
					observerRef?.current?.observe(el);
				}
			}}
			style={{
				top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
			}}
			className="z-[1] left-0 right-0 absolute flex justify-center pointer-events-none"
		>
			<div
				className={`flex backdrop-blur-md rounded-lg w-4/5 sm:w-[600px] min-h-40 max-h-96 sm:max-h-[65vh] p-2 sm:p-4 justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
			>
				<ErrorBoundary errorComponent={ErrorFallback}>
					<SuggestionPanel promise={promise} />
				</ErrorBoundary>
			</div>
		</div>
	);
};
