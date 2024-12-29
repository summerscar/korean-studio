import {
	type TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { AnnotationPanel } from "@/components/annotation-panel";
import { PapagoPanel } from "@/components/papago-render";
import type { AnnotationItem } from "@/types/annotation";
import { useClickAway } from "ahooks";
import clsx from "clsx";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const NotableText = ({
	children,
	annotation,
}: { children: string; annotation?: AnnotationItem }) => {
	const [showPapago, setShowPapago] = useState(false);
	const [showAnnotation, setShowAnnotation] = useState(false);
	const spanRef = useRef<HTMLSpanElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const papagoPromise = useRef<Promise<TranslateResult> | null>(null);
	const isShowPanel = showPapago || showAnnotation;

	useClickAway(() => {
		setShowPapago(false);
		setShowAnnotation(false);
	}, panelRef);

	const showPapagoPanel = () => {
		if (isShowPanel) return;
		if (!papagoPromise.current) {
			papagoPromise.current = papagoTranslateAction(children);
		}
		setShowPapago(true);
	};

	return (
		<span
			className={clsx(
				"dark:bg-slate-600 inline-block rounded-sm relative cursor-pointer",
				annotation ? "bg-orange-400/80" : "bg-yellow-200/80",
			)}
			onClick={showPapagoPanel}
			ref={spanRef}
		>
			{children}
			{annotation && (
				<span
					className="absolute -top-0.5 -right-2 cursor-pointer size-2 rounded-sm bg-orange-500"
					onClick={(e) => {
						e.stopPropagation();
						setShowAnnotation(true);
					}}
				/>
			)}

			{showAnnotation &&
				createPortal(
					<AnnotationPanel
						annotation={annotation}
						rect={spanRef.current!.getBoundingClientRect()}
						showAbove={true}
						ref={panelRef}
					/>,
					document.body,
				)}
			{showPapago &&
				createPortal(
					<PapagoPanel
						ref={panelRef}
						showAbove={false}
						rect={spanRef.current!.getBoundingClientRect()}
						promise={papagoPromise.current!}
					/>,
					document.body,
				)}
		</span>
	);
};

export { NotableText };
