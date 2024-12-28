import {
	type TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { PapagoPanel } from "@/components/papago-render";
import { useClickAway } from "ahooks";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";

const NotableText = ({ children }: { children: string }) => {
	const [showPapago, setShowPapago] = useState(false);
	const spanRef = useRef<HTMLSpanElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const papagoPromise = useRef<Promise<TranslateResult> | null>(null);

	useClickAway(() => {
		setShowPapago(false);
	}, panelRef);

	const showPapagoPanel = () => {
		if (!papagoPromise.current) {
			papagoPromise.current = papagoTranslateAction(children);
		}
		setShowPapago(true);
	};

	return (
		<span
			className="bg-yellow-200/80 dark:bg-slate-600 inline-block rounded-sm relative cursor-pointer"
			onClick={showPapagoPanel}
			ref={spanRef}
		>
			{children}
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
