import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { components } from "@/components/markdown-render";
import type { Levels } from "@/types";
import { compileMDX } from "next-mdx-remote/rsc";
import { redirect } from "next/navigation";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

export async function loadMDX(level: Levels, title: string) {
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
}
