import {
	type TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { AnnotationPanel } from "@/components/annotation-panel";
import { PapagoPanel } from "@/components/papago-render";
import type { AnnotationItem } from "@/types/annotation";
import { getPortalParent } from "@/utils/get-portal-parent";
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

	const showPapagoPanel = (e: React.MouseEvent) => {
		// 防止触发挂在上层元素的 ClickAway 检测
		// next.js 的 root 是 document，正好避免了 ClickAway 触发，但是 createPortal 的时候不行
		// https://codepen.io/summerscar/pen/ogvoBjW?editors=1111
		e.stopPropagation();
		if (isShowPanel) return;
		if (!papagoPromise.current) {
			papagoPromise.current = papagoTranslateAction(children);
		}
		setShowPapago(true);
	};

	return (
		<span
			className={clsx(
				"dark:bg-slate-600 inline rounded-sm relative cursor-pointer indent-0",
				annotation ? "bg-orange-400/80" : "bg-yellow-200/80",
			)}
			onClick={showPapagoPanel}
			ref={spanRef}
		>
			{children}
			{annotation && (
				<span
					className="absolute -top-0.5 -right-2 cursor-pointer size-2 rounded-sm bg-orange-500 z-[1]"
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
					getPortalParent(),
				)}
			{showPapago &&
				createPortal(
					<PapagoPanel
						ref={panelRef}
						showAbove={false}
						rect={spanRef.current!.getBoundingClientRect()}
						promise={papagoPromise.current!}
					/>,
					getPortalParent(),
				)}
		</span>
	);
};

export { NotableText };
