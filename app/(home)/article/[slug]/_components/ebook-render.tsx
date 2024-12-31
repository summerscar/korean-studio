import { HighLightedText } from "@/components/high-lighted-text";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import parse, {
	type Element,
	type Text,
	type HTMLReactParserOptions,
} from "html-react-parser";
import { memo, useMemo } from "react";

const EBookRender = memo(
	({
		dom,
		bookId,
		sectionId,
		containerRef,
	}: {
		dom: HTMLElement;
		bookId: string;
		sectionId: string;
		containerRef: React.RefObject<HTMLDivElement | null>;
	}) => {
		const options: HTMLReactParserOptions = useMemo(
			() => ({
				replace: (dom) => {
					if (
						(dom as Text).type === "text" &&
						(dom.parent as Element)?.name === "p"
					) {
						const paragraphIndex = Number(
							(dom.parent as Element).attribs["data-paragraph-index"] || 0,
						);
						const text = (dom as unknown as Text).data;
						return (
							<HighLightedText
								articleId={bookId}
								chapterId={sectionId}
								paragraphIndex={paragraphIndex}
							>
								{text}
							</HighLightedText>
						);
					}
				},
			}),
			[bookId, sectionId],
		);

		return (
			<SelectToSearch
				showAdd
				showAnnotate
				prompt="sentence"
				className="w-full h-full"
			>
				{/* https://github.com/remarkablemark/html-react-parser/issues/1302 */}
				<div className="w-full h-full ebook" ref={containerRef}>
					{parse(dom.outerHTML.replaceAll("!important", ""), options)}
				</div>
			</SelectToSearch>
		);
	},
);

export { EBookRender };
