import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { components } from "@/components/markdown-render";
import type { Levels } from "@/types";
import { fromHtmlIsomorphic } from "hast-util-from-html-isomorphic";
import { compileMDX } from "next-mdx-remote/rsc";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkFlexibleToc, { type TocItem } from "remark-flexible-toc";
import remarkGfm from "remark-gfm";

const loadMDXData = unstable_cache(async (level: Levels, title: string) => {
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
});

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
								content: fromHtmlIsomorphic(
									`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 heading-link"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>`,
									{ fragment: true },
								).children,
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
