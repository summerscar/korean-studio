import { type DocPathParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { isDev } from "@/utils/is-dev";
import { type FileItem, listAllDocs } from "@/utils/list-docs";
import { loadMDX } from "@/utils/load-mdx";
import { timeOut } from "@/utils/time-out";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MDContentWrapper } from "./_components/markdown-wrapper";
import { Toc } from "./_components/toc";

export async function generateMetadata(props: {
	params: Promise<DocPathParams>;
}): Promise<Metadata> {
	const params = await props.params;
	const t = await getServerI18n("Header");
	const level = params.doc_path[0] as Levels;

	const title =
		params.doc_path.length > 1
			? ((
					await loadMDX(
						level,
						params.doc_path.slice(1).map(decodeURIComponent).join("/"),
					)
				)[0].frontmatter.title as string) ||
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

export default async function Page(props: { params: Promise<DocPathParams> }) {
	const params = await props.params;
	const level = params.doc_path[0] as Levels;

	if (![Levels.Beginner, Levels.Intermediate].includes(level)) {
		redirect("/learn/beginner");
	}

	const { doc_path: docPath } = params;
	const docPathString = docPath.slice(1).map(decodeURIComponent).join("/");
	const [mdx, toc] = await loadMDX(level, docPathString || "_intro");
	isDev && (await timeOut(500));
	return (
		<>
			<MDContentWrapper>{mdx.content}</MDContentWrapper>
			<Toc toc={toc} />
		</>
	);
}
