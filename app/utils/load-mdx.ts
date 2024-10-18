import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { components } from "@/components/markdown-render";
import type { Levels } from "@/types";
import { compileMDX } from "next-mdx-remote/rsc";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";
import rehypeSlug from "rehype-slug";
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
	const data = await loadMDXData(level, title);
	return compileMDX({
		source: data,
		components: { ...components },
		options: {
			mdxOptions: {
				remarkPlugins: [remarkGfm],
				rehypePlugins: [rehypeSlug],
			},
			parseFrontmatter: true,
		},
	});
});
