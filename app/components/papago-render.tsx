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
					className="size-24 animate-pulse self-center opacity-80"
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
					src="/img/papago.png"
					className="w-6 h-6 inline-block cursor-pointer"
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
									{posItem.type}
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
