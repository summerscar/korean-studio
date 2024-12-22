import type {
	TranslateResult,
	papagoTranslateAction,
} from "@/actions/papago-translate-action";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { Suspense, use } from "react";
import { Pronunciation } from "./pronunciation";

const PapagoResult = ({
	promise,
	onSearch,
}: { promise: Promise<TranslateResult>; onSearch?: () => void }) => {
	return (
		<Suspense
			fallback={
				<img
					src="/img/papago.png"
					className="size-24 animate-pulse self-center opacity-80 object-contain"
					alt="Papago"
				/>
			}
		>
			<PapagoPromise promise={promise} onSearch={onSearch} />
		</Suspense>
	);
};

const PapagoPromise = ({
	promise,
	onSearch,
}: { promise: Promise<TranslateResult>; onSearch?: () => void }) => {
	const res = use(promise);
	return <PapagoResultRender data={res} onSearch={onSearch} />;
};

const PapagoResultRender = ({
	data,
	onSearch,
}: {
	data: Awaited<ReturnType<typeof papagoTranslateAction>>;
	onSearch?: () => void;
}) => {
	return (
		<SelectToSearch
			showAdd
			prompt={"sentence"}
			className="w-full h-fit p-2 sm:p-4"
		>
			<div className="text-xl">
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
							<Pronunciation text={item.entry.replace(/<b>(.+)<\/b>/, "$1")} />
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
									<span className="rounded-box bg-slate-200/40 px-2">
										{posItem.type}
									</span>
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
														<p
															// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
															dangerouslySetInnerHTML={{ __html: example.text }}
														/>
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

export { PapagoResult };
