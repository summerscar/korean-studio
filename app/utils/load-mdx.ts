import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { components } from "@/components/markdown-render";
import type { Levels } from "@/types";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { compileMDX } from "next-mdx-remote/rsc";
import { redirect } from "next/navigation";
import { cache } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";
import remarkGfm from "remark-gfm";

const loadMDXData = async (level: Levels, title: string) => {
	const root = path.resolve();
	const mdxPath = path.join(root, "mdx", level, `${title}.mdx`);
	const mdPath = path.join(root, "mdx", level, `${title}.md`);
	let filePath = "";

	if (fs.existsSync(mdxPath)) {
		filePath = mdxPath;
	} else if (fs.existsSync(mdPath)) {
		filePath = mdPath;
	} else {
		redirect(`/learn/${level}`);
	}

	const data = await readFile(filePath, { encoding: "utf-8" });
	return data;
};

export const loadMDX = cache(async (level: Levels, title: string) => {
	const toc: TocItem[] = [];
	const data = await loadMDXData(level, title);
	return [
		await compileMDX({
			source: data,
			components: { ...components },
			options: {
				mdxOptions: {
					remarkPlugins: [
						remarkGfm,
						[remarkFlexibleToc, { tocRef: toc, skipLevels: [] }],
					],
					rehypePlugins: [
						rehypeSlug,
						[
							rehypeAutolinkHeadings,
							{
								// TODO: use jsx
								content: fromHtmlIsomorphic(`<span class="anchor">📎</span>`, {
									fragment: true,
								}).children,
							},
						],
					],
				},
				parseFrontmatter: true,
			},
		}),
		toc,
	] as const;
});
