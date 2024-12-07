import { components } from "@/components/markdown-render";
import { compileMDX } from "next-mdx-remote/rsc";

const renderMDTextServer = async (text: string) => {
	const { content } = await compileMDX({
		source: text,
		components: { ...components },
	});
	return <div className="markdown-body">{content}</div>;
};

export { renderMDTextServer };
