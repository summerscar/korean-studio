import type {
	TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { Pronunciation } from "@/components/pronunciation";
import { ErrorFallback } from "@/components/suspend-error-fallback";
import { usePanelReposition } from "@/hooks/use-panel-reposition";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { papagoWebSearch } from "@/service/papago-web-search";
import type { SITES_LANGUAGE } from "@/types/site";
import { useLocale } from "next-intl";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { Suspense, use } from "react";

const PapagoResult = ({ promise }: { promise: Promise<TranslateResult> }) => {
	return (
		<ErrorBoundary errorComponent={ErrorFallback}>
			<Suspense
				fallback={
					<img
						src="/img/papago.png"
						className="size-24 animate-pulse self-center opacity-80 object-contain"
						alt="Papago"
					/>
				}
			>
				<PapagoPromise promise={promise} />
			</Suspense>
		</ErrorBoundary>
	);
};

const PapagoPromise = ({ promise }: { promise: Promise<TranslateResult> }) => {
	const res = use(promise);
	return <PapagoResultRender data={res} />;
};

const PapagoResultRender = ({
	data,
}: {
	data: Awaited<ReturnType<typeof papagoTranslateAction>>;
}) => {
	const locale = useLocale();
	const onSearch = () => {
		papagoWebSearch(data.text, locale as SITES_LANGUAGE);
	};
	return (
		<SelectToSearch
			showAdd
			prompt={"sentence"}
			className="w-full h-fit p-2 sm:p-4"
		>
			<div className="text-xl">
				<p className="text-xs text-base-content/50 mb-1 pl-1 border-l-4 border-base-content/50">
					{data.text}
				</p>
				{data.translatedText}
				<img
					onClick={onSearch}
					/** 防止 useSelectToSearch 触发 */
					onMouseUpCapture={(e) => e.stopPropagation()}
					src="/img/papago.png"
					className="w-6 h-6 inline-block cursor-pointer select-none"
					alt="Papago"
				/>
			</div>
			<ul className="pt-2">
				{data.dict.items?.map((item) => (
					<li key={item.gdid} className="mb-3 last:mb-0">
						<div>
							<span
								className="text-lg"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
								dangerouslySetInnerHTML={{ __html: item.entry }}
							/>
							<Pronunciation
								text={item.entry.replace(/<b>(.+)<\/b>/, "$1")}
								tooltip
							/>
							{item.hanjaEntry && (
								<span className="text-sm text-base-content/60 pl-2">
									[{item.hanjaEntry}]
								</span>
							)}
						</div>
						<ul>
							{item.pos.map((posItem, posIndex) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<li key={posIndex} className="mb-1 last:mb-0 text-sm">
									{posItem.type && (
										<span className="rounded-box bg-slate-200/40 px-2">
											{posItem.type}
										</span>
									)}
									<ul>
										{posItem.meanings.map((meaning, meaningIndex) => (
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											<li key={meaningIndex}>
												{meaningIndex + 1}.{" "}
												<span
													// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
													dangerouslySetInnerHTML={{
														__html: meaning.meaning,
													}}
												/>
												{meaning.examples?.map((example) => (
													<div key={example.text} className="pl-4 text-sm">
														<p>
															<span
																// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
																dangerouslySetInnerHTML={{
																	__html: example.text,
																}}
															/>
															<Pronunciation
																text={example.text.replace(/<[^>]*>/g, "")}
															/>
														</p>
														<p>{example.translatedText}</p>
													</div>
												))}
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</SelectToSearch>
	);
};

const PapagoPanel = ({
	showAbove,
	rect,
	promise,
	ref,
}: {
	showAbove: boolean;
	rect: DOMRect;
	promise: Promise<TranslateResult>;
	ref?: React.RefObject<HTMLDivElement | null>;
}) => {
	const observerRef = usePanelReposition({ showAbove, rect });
	return (
		<div
			style={{
				top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
				left: `${rect.right - rect.width / 2 + window.scrollX}px`,
			}}
			className="z-[5] absolute flex justify-center pointer-events-none"
			ref={(el) => {
				if (el) {
					ref && (ref.current = el);
					observerRef.current = el;
					return () => {
						observerRef.current = null;
						ref && (ref.current = null);
					};
				}
			}}
		>
			<div
				className={`flex backdrop-blur-xl rounded-lg w-[60vw] sm:w-[400px] min-h-40 max-h-96 sm:max-h-[50vh] justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
			>
				<PapagoResult promise={promise} />
			</div>
		</div>
	);
};

export { PapagoResult, PapagoPanel };
