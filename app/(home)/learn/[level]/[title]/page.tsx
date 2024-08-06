import { listAllDocs } from "@/components/docs-category";
import type { DocsTitleParams, LevelParams, Levels } from "@/types";
import { loadMDX } from "@/utils/load-mdx";
import { generateMetadata } from "../page";

export { generateMetadata };

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
