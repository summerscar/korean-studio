import fs from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { listAllDocs } from "@/components/docs-category";
import type { DocsTitleParams, LevelParams, Levels } from "@/types";
import { compileMDX } from "next-mdx-remote/rsc";
import { redirect } from "next/navigation";
import { generateMetadata } from "../page";

export { generateMetadata };

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
		options: {
			parseFrontmatter: true,
		},
	});
}

export async function generateStaticParams({
	params: { level },
}: { params: LevelParams }) {
	const docs = await listAllDocs(level);
	return docs.map((doc) => ({
		title: doc.replace(/\.mdx?/, ""),
	}));
}

export default async function Page({
	params: { level, title },
}: { params: LevelParams & DocsTitleParams }) {
	const mdx = await loadMDX(level, title);

	return (
		<article className="markdown-body">
			<p>{JSON.stringify(mdx.frontmatter, null, 2)}</p>
			{mdx.content}
		</article>
	);
}
