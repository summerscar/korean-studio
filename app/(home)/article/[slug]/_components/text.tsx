import { RenderMDTextServer } from "@/components/render-md-server";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";

const Text = ({ content }: { content: string }) => {
	const resolvedContent = content.replace("frameborder", "frameBorder");
	return (
		<SelectToSearch showAdd prompt="sentence">
			<RenderMDTextServer
				text={resolvedContent}
				className={clsx(notoKR.className, "pt-2")}
			/>
		</SelectToSearch>
	);
};

export { Text };
