import { components } from "@/components/markdown-render";
import clsx from "clsx";
import { compileMDX } from "next-mdx-remote/rsc";

const RenderMDTextServer = async ({
	text,
	className,
}: { text: string; className?: string }) => {
	const { content } = await compileMDX({
		source: text,
		components: { ...components },
	});
	return <div className={clsx("markdown-body", className)}>{content}</div>;
};

export { RenderMDTextServer };
