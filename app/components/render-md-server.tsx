import { components } from "@/components/markdown-render";
import clsx from "clsx";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

const RenderMDTextServer = async ({
	text,
	className,
	...props
}: { text: string } & ComponentProps<"div">) => {
	const { content } = await compileMDX({
		source: text,
		components: { ...components },
	});
	return (
		<div className={clsx("markdown-body", className)} {...props}>
			{content}
		</div>
	);
};

export { RenderMDTextServer };
