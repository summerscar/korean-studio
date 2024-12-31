import { generateWordSuggestionAction } from "@/actions/generate-word-action";
import { papagoTranslateAction } from "@/actions/papago-translate-action";
import { FloatButton } from "@/components/float-button";
import { callModal } from "@/components/modal";
import { PapagoPanel } from "@/components/papago-render";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import { useUserDictList } from "@/hooks/use-dict-list";
import { usePanelReposition } from "@/hooks/use-panel-reposition";
import {} from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { addWordsToUserDict } from "@/service/add-words-to-user-dict";
import type { SITES_LANGUAGE } from "@/types/site";
import { getPortalParent } from "@/utils/get-portal-parent";
import { timeOut } from "@/utils/time-out";
import { useMemoizedFn } from "ahooks";
import { signIn } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnnotationPanel } from "./annotation-panel";

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
	showAnnotate?: boolean;
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
	showAnnotate = false,
	onClose,
	onNewPanel,
	position = "bottom",
	prompt,
	ref,
}: FloatButtonsPanelProps) {
	const locale = useLocale() as SITES_LANGUAGE;
	const translate = useTranslations();
	const { isLogin } = useUser();
	const dictList = useUserDictList({ filterFav: true });
	const [showAIPanel, setShowAIPanel] = useState(false);
	const [showPapagoPanel, setShowPapagoPanel] = useState(false);
	const [showAnnotatePanel, setShowAnnotatePanel] = useState(false);
	const showNewPanel = showAIPanel || showPapagoPanel || showAnnotatePanel;
	const memoedGetRect = useMemoizedFn(getRect);
	const [range, setRange] = useState<Range | undefined>(undefined);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const rect = useMemo(() => {
		return memoedGetRect();
	}, [memoedGetRect, selectedText]);

	useEffect(() => {
		if (selectedText && showAnnotate) {
			setRange(window.getSelection()?.getRangeAt(0));
		}
	}, [selectedText, showAnnotate]);

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
			addWordsToUserDict(dictId, [word], translate);
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

	const onOpenNewPanel = async () => {
		await timeOut(16);
		onNewPanel?.();
	};

	const onPapagoTranslate = async () => {
		if (!selectedText) return;
		await onOpenNewPanel();
		setShowPapagoPanel(true);
	};

	const openAISuggestion = async () => {
		if (!prompt) return;
		await onOpenNewPanel();
		setShowAIPanel(true);
	};

	const onAnnotate = async () => {
		if (!isLogin) {
			signIn();
			return;
		}

		await onOpenNewPanel();
		setShowAnnotatePanel(true);
	};

	const showAbove = useMemo(() => {
		if (!showNewPanel) return false;

		const windowHeight = window.innerHeight;
		const spaceBelow = windowHeight - rect.bottom;
		const spaceAbove = rect.top;
		return spaceBelow < 300 && spaceAbove > spaceBelow;
	}, [showNewPanel, rect]);

	// 只需要在 showNewPanel 时，渲染一次
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const panel = useMemo(
		() => (
			<div ref={ref} data-ignore-click-away="true">
				{showAIPanel ? (
					<AIPanel
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
						rect={rect}
						showAbove={showAbove}
					/>
				) : showAnnotatePanel ? (
					<AnnotationPanel rect={rect} showAbove={showAbove} range={range} />
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
						{showAnnotate && (
							<FloatButton onClick={onAnnotate} icon="annotate" />
						)}
						{showAdd && <FloatButton onClick={onAdd} icon="add" />}
					</div>
				)}
			</div>
		),
		[showNewPanel, selectedText],
	);

	return createPortal(panel, getPortalParent());
}

const AIPanel = ({
	showAbove,
	rect,
	promise,
}: {
	showAbove: boolean;
	rect: DOMRect;
	promise: Promise<string>;
}) => {
	const observerRef = usePanelReposition({ showAbove, rect });
	return (
		<div
			ref={observerRef}
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
