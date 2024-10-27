import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";
import { type DocPathParams, Levels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import { isDev } from "@/utils/is-dev";
import { type FileItem, listAllDocs } from "@/utils/list-docs";
import { loadMDX } from "@/utils/load-mdx";
import { timeOut } from "@/utils/time-out";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MDContentWrapper } from "./_components/markdown-wrapper";
import { Toc } from "./_components/toc";

export async function generateMetadata(props: {
	params: Promise<DocPathParams>;
}): Promise<Metadata> {
	const params = await props.params;
	const t = await getServerI18n("Header");
	const level = params.doc_path[0] as Levels;

	if (params.doc_path.length <= 1) return { title: t(level) };

	const docData = await loadMDX(
		level,
		params.doc_path.slice(1).map(decodeURIComponent).join("/"),
	);
	const title =
		(docData[0].frontmatter.title as string) ||
		decodeURIComponent(params.doc_path.pop() || "");

	return {
		title,
		description: docData[0].frontmatter.description as string,
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
				.map((doc) => (doc as FileItem).relativeUrl.split("/"));
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
	const docs = (await listAllDocs(level)).flatMap((doc) => {
		if ("children" in doc) {
			return doc.children;
		}
		return doc;
	}) as FileItem[];
	const [mdx, toc] = await loadMDX(level, docPathString || "_intro");

	const lastModified = new Date(
		Number((mdx.frontmatter["last-modified"] as string) || 0),
	).toUTCString();

	const targetDocIndex = docs.findIndex(
		(doc) => doc.title === (mdx.frontmatter.title as string),
	);
	const prevDoc = docs[targetDocIndex - 1];
	const nextDoc = docs[targetDocIndex + 1];

	isDev && (await timeOut(500));

	const bottomNav = (
		<div className="flex justify-between pt-2">
			<div>
				{prevDoc && (
					<Link
						prefetch
						href={`/learn/${prevDoc.relativeUrl}`}
						className="btn glass btn-md gap-3"
					>
						<PrevIcon className="w-4 h-4" />
						{prevDoc.title}
					</Link>
				)}
			</div>
			<div>
				{nextDoc && (
					<Link
						prefetch
						href={`/learn/${nextDoc.relativeUrl}`}
						className="btn glass btn-md gap-3"
					>
						{nextDoc.title}
						<NextIcon className="w-4 h-4" />
					</Link>
				)}
			</div>
		</div>
	);

	return (
		<>
			<MDContentWrapper lastModified={lastModified} bottomNav={bottomNav}>
				{mdx.content}
				<div className="divider" />
			</MDContentWrapper>
			<Toc toc={toc} />
		</>
	);
}
