import { components } from "@/components/markdown-render";
import clsx from "clsx";
import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ComponentProps } from "react";

const RenderMDTextServer = async ({
	text,
	className,
	mdComponents,
	...props
}: {
	text: string;
	mdComponents?: MDXComponents;
} & ComponentProps<"div">) => {
	const { content } = await compileMDX({
		source: text,
		components: { ...components, ...mdComponents },
	});
	return (
		<div className={clsx("markdown-body", className)} {...props}>
			{content}
		</div>
	);
};

export { RenderMDTextServer };
