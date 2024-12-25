import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import {
	type TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { addWordsToUserDictAction } from "@/actions/user-dict-action";
import { FloatButton } from "@/components/float-button";
import { callModal } from "@/components/modal";
import { PapagoResult } from "@/components/papago-render";
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
let _lastSelectCache: string | undefined;

interface FloatButtonsPanelProps {
	getRect: () => DOMRect;
	selectedText: string;
	showTranslate?: boolean;
	showCopy?: boolean;
	showAI?: boolean;
	showAdd?: boolean;
	position?: "top" | "bottom";
	onClose?: () => void;
	prompt?: (word: string, locale: SITES_LANGUAGE) => string;
	ref?: React.RefObject<HTMLDivElement | null>;
	onNewPanel?: () => void;
}

export function FloatButtonsPanel({
	getRect,
	selectedText,
	showTranslate = true,
	showCopy = true,
	showAI = true,
	showAdd = false,
	onClose,
	onNewPanel,
	position = "bottom",
	prompt,
	ref,
}: FloatButtonsPanelProps) {
	const locale = useLocale() as SITES_LANGUAGE;
	const translate = useTranslations();
	const observerRef = useRef<ResizeObserver>(null);
	const { isLogin } = useUser();
	const dictList = useUserDictList({ filterFav: true });
	const [showAIPanel, setShowAIPanel] = useState(false);
	const [showPapagoPanel, setShowPapagoPanel] = useState(false);
	const showNewPanel = showAIPanel || showPapagoPanel;
	const memoedGetRect = useMemoizedFn(getRect);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const rect = useMemo(() => {
		return memoedGetRect();
	}, [memoedGetRect, showNewPanel, selectedText]);

	const onAdd = useMemoizedFn(async () => {
		onClose?.();
		if (!isLogin) {
			signIn();
			return;
		}
		if (selectedText) {
			const dictId = (await callModal({
				type: "select",
				title: `Select Dict to add 【${selectedText}】`,
				options: dictList.map((dict) => ({
					value: dict.id,
					label: dict.name,
				})),
				inputDefaultValue: dictList.find((dict) => dict.id === _lastSelectCache)
					?.id,
			})) as string;
			if (!dictId) return;
			_lastSelectCache = dictId;
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

	const onPapagoSearch = () => {
		if (selectedText) {
			const papagoUrl = `https://papago.naver.com/?sk=ko&tk=${locale}&st=${encodeURIComponent(selectedText)}`;
			window.open(
				papagoUrl,
				"PapagoSearch",
				"width=400,height=600,left=150,top=150",
			);
		}
	};

	const onCopy = async () => {
		try {
			await navigator.clipboard.writeText(selectedText);
		} catch (err) {
			console.error("Failed to copy text: ", err);
		} finally {
			onClose?.();
		}
	};

	const onPapagoTranslate = async () => {
		if (!selectedText) return;
		await timeOut(16);
		setShowPapagoPanel(true);
		onNewPanel?.();
	};

	const openAISuggestion = async () => {
		if (!prompt) return;
		await timeOut(16);
		setShowAIPanel(true);
		onNewPanel?.();
	};

	const showAbove = useMemo(() => {
		if (!showNewPanel) return false;

		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		return spaceBelow < 300 && spaceAbove > spaceBelow;
	}, [showNewPanel, rect]);

	const onResize = useMemoizedFn((entries: ResizeObserverEntry[]) => {
		const el = entries[0].target as HTMLDivElement;
		const { height, bottom, right, width } = el.getBoundingClientRect();
		if (showAbove) {
			el.style.top = `${rect.top - height + window.scrollY}px`;
		} else {
			if (bottom + window.scrollY > document.body.clientHeight) {
				el.style.top = `${rect.top - height + window.scrollY}px`;
			}
		}

		if (right + window.scrollX > document.body.clientWidth) {
			el.style.left = `${document.body.clientWidth - width - 50 + window.scrollX}px`;
		}
	});

	useEffect(() => {
		observerRef.current = new ResizeObserver(onResize);
		return () => {
			observerRef.current?.disconnect();
		};
	}, [onResize]);

	// 只需要在 showNewPanel 时，渲染一次
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
				) : showPapagoPanel ? (
					<PapagoPanel
						promise={papagoTranslateAction(selectedText, locale)}
						onSearch={onPapagoSearch}
						rect={rect}
						showAbove={showAbove}
						observerRef={observerRef}
					/>
				) : (
					<div
						style={{
							...(position === "top"
								? { top: `${rect.top - 35 + window.scrollY}px` }
								: { top: `${rect.bottom + window.scrollY}px` }),
							left: `${rect.right - rect.width / 2 + window.scrollX}px`,
						}}
						className="z-[5] border border-base-content/10 bg-white/10 shadow backdrop-blur-md flex absolute rounded overflow-hidden -translate-x-1/4"
					>
						{showTranslate && (
							<FloatButton onClick={onPapagoTranslate} icon="translate" />
						)}
						{showCopy && <FloatButton onClick={onCopy} icon="copy" />}
						{showAI && prompt && (
							<FloatButton onClick={openAISuggestion} icon="sparkles" />
						)}
						{showAdd && <FloatButton onClick={onAdd} icon="add" />}
					</div>
				)}
			</div>
		),
		[showNewPanel, selectedText],
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
					return () => observerRef.current?.unobserve(el);
				}
			}}
			style={{
				top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
			}}
			className="z-[5] left-0 right-0 absolute flex justify-center pointer-events-none"
		>
			<div
				className={`flex backdrop-blur-xl rounded-lg w-4/5 sm:w-[600px] min-h-40 max-h-96 sm:max-h-[65vh] justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
			>
				<ErrorBoundary errorComponent={ErrorFallback}>
					<SuggestionPanel promise={promise} />
				</ErrorBoundary>
			</div>
		</div>
	);
};

const PapagoPanel = ({
	showAbove,
	rect,
	promise,
	onSearch,
	observerRef,
}: {
	observerRef: React.RefObject<ResizeObserver | null>;
	showAbove: boolean;
	rect: DOMRect;
	promise: Promise<TranslateResult>;
	onSearch: () => void;
}) => {
	return (
		<div
			style={{
				top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
				left: `${rect.right - rect.width / 2 + window.scrollX}px`,
			}}
			className="z-[5] absolute flex justify-center pointer-events-none"
			ref={(el) => {
				if (el) {
					observerRef?.current?.observe(el);
					return () => observerRef.current?.unobserve(el);
				}
			}}
		>
			<div
				className={`flex backdrop-blur-xl rounded-lg w-[60vw] sm:w-[400px] min-h-40 max-h-96 sm:max-h-[65vh] justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
			>
				<ErrorBoundary errorComponent={ErrorFallback}>
					<PapagoResult promise={promise} onSearch={onSearch} />
				</ErrorBoundary>
			</div>
		</div>
	);
};
