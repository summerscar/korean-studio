import { RenderMDTextServer } from "@/components/render-md-server";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import clsx from "clsx";
import { TranslateParagraph } from "./translate-paragraph";

const Text = ({
	content,
	articleId,
}: { content: string; articleId: string }) => {
	const resolvedContent = content.replace("frameborder", "frameBorder");
	let paragraphIndex = 0;

	return (
		<SelectToSearch showAdd showAnnotate prompt="sentence">
			<RenderMDTextServer
				text={resolvedContent}
				className={clsx("pt-2")}
				mdComponents={{
					p: (props: { children: React.ReactNode }) => {
						const currentParagraphIndex = paragraphIndex++;
						return (
							<TranslateParagraph
								{...props}
								articleId={articleId}
								paragraphIndex={currentParagraphIndex}
								data-paragraph-index={currentParagraphIndex}
							/>
						);
					},
				}}
			/>
		</SelectToSearch>
	);
};

export { Text };
