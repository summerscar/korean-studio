import { type FileItem, listAllDocs } from "@/components/docs-category";
import { type DocPathParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { loadMDX } from "@/utils/load-mdx";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata({
	params,
}: {
	params: DocPathParams;
}): Promise<Metadata> {
	const t = await getServerI18n("Header");
	const level = params.doc_path[0] as Levels;

	const title =
		params.doc_path.length > 1
			? ((
					await loadMDX(
						level,
						params.doc_path.slice(1).map(decodeURIComponent).join("/"),
					)
				).frontmatter.title as string) ||
				decodeURIComponent(params.doc_path.pop() || "")
			: t(level);

	return {
		title,
	};
}

export async function generateStaticParams() {
	const levels = [Levels.Beginner, Levels.Intermediate];
	const allPath = await Promise.all(
		levels.map(async (level) => {
			const docs = await listAllDocs(level);
			const flatten = docs
				.flatMap((doc) => {
					if ("children" in doc) {
						return doc.children;
					}
					return doc;
				})
				.map((doc) =>
					`${level}/${(doc as FileItem).relativePath}`
						.replace(/\.mdx?/, "")
						.split("/"),
				);
			return flatten;
		}),
	);

	const staticParams = allPath
		.flat()
		.map((docPath) => ({
			doc_path: docPath,
		}))
		.concat(levels.map((level) => ({ doc_path: [level] })));

	return staticParams;
}

export default async function Page({ params }: { params: DocPathParams }) {
	const level = params.doc_path[0] as Levels;

	if (![Levels.Beginner, Levels.Intermediate].includes(level)) {
		redirect("/learn/beginner");
	}

	const { doc_path: docPath } = params;
	const docPathString = docPath.slice(1).map(decodeURIComponent).join("/");
	const mdx = await loadMDX(level, docPathString || "_intro");

	return (
		<>
			<article className="markdown-body">
				<p>{JSON.stringify(mdx.frontmatter, null, 2)}</p>
				{mdx.content}
			</article>
		</>
	);
}
