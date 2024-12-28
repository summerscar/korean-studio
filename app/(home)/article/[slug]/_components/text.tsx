import { RenderMDTextServer } from "@/components/render-md-server";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import clsx from "clsx";
import { TranslateParagraph } from "./translate-paragraph";

const Text = ({ content }: { content: string }) => {
	const resolvedContent = content.replace("frameborder", "frameBorder");
	let paragraphIndex = 0;

	return (
		<SelectToSearch showAdd prompt="sentence">
			<RenderMDTextServer
				text={resolvedContent}
				className={clsx("pt-2")}
				mdComponents={{
					p: (props: { children: React.ReactNode }) => (
						<TranslateParagraph
							{...props}
							data-paragraph-index={paragraphIndex++}
						/>
					),
				}}
			/>
		</SelectToSearch>
	);
};

export { Text };
