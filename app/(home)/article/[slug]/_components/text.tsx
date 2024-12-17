import { SelectToSearch } from "@/hooks/use-select-to-search";
import { renderMDTextServer } from "@/utils/render-md-server";

const Text = ({ content }: { content: string }) => {
	const resolvedContent = content.replace("frameborder", "frameBorder");
	return (
		<SelectToSearch showAdd prompt="sentence">
			{renderMDTextServer(resolvedContent)}
		</SelectToSearch>
	);
};

export { Text };
