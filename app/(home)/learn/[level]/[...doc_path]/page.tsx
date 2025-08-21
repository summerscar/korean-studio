import NextIcon from "@/assets/svg/next.svg";
import PrevIcon from "@/assets/svg/prev.svg";
import { type DocPathParams, Levels } from "@/types";
import { isDev } from "@/utils/is-dev";
import { type FileItem, listAllDocs } from "@/utils/list-docs";
import { loadMDX } from "@/utils/load-mdx";
import { timeOut } from "@/utils/time-out";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { MDContentWrapper } from "../_components/markdown-wrapper";
import { Toc } from "../_components/toc";

export async function generateMetadata(props: {
	params: Promise<DocPathParams>;
}): Promise<Metadata> {
	const params = await props.params;
	const t = await getTranslations("Header");
	const level = params.level;

	if (!params.doc_path.length) return { title: t(level) };

	const docData = await loadMDX(
		level,
		params.doc_path.map(decodeURIComponent).join("/"),
	);
	const title = `${
		(docData[0].frontmatter.title as string) ||
		decodeURIComponent(params.doc_path.pop() || "")
	} - 韩语${level === "beginner" ? "入门" : "中级"}语法`;

	return {
		title,
		description: docData[0].frontmatter.description as string,
	};
}

export async function generateStaticParams(props: {
	params: Awaited<PageProps<'/learn/[level]/[...doc_path]'>['params']>;
}) {
	const { level } = await props.params;
	const docs = await listAllDocs(level);
	const flatten = docs
		.flatMap((doc) => {
			if ("children" in doc) {
				return doc.children;
			}
			return doc;
		})
		.map((doc) => (doc as FileItem).relativeUrl.split("/"));

	const staticParams = flatten.map((docPath) => ({
		doc_path: docPath,
	}));
	return staticParams;
}

export default async function Page(props: { params: Promise<DocPathParams> }) {
	const { level, doc_path: docPath = [] } = await props.params;

	if (![Levels.Beginner, Levels.Intermediate].includes(level)) {
		redirect("/learn/beginner");
		return;
	}

	const docPathString = docPath
		.map(decodeURIComponent)
		.map((_) => _.normalize("NFC"))
		.join("/");
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

	const NavButton = ({
		children,
		href,
	}: { children: ReactNode; href: string }) => (
		<Link
			prefetch
			href={href}
			className="btn glass btn-md gap-2 w-full flex items-center flex-nowrap min-w-0 px-2 sm:px-3 sm:gap-3"
		>
			{children}
		</Link>
	);

	// 使用方式：
	const bottomNav = (
		<div className="flex justify-between pt-2 min-w-0">
			<div className="max-w-[50%] min-w-0">
				{prevDoc && (
					<NavButton href={`/learn/${level}/${prevDoc.relativeUrl}`}>
						<PrevIcon className="w-4 h-4 shrink-0" />
						<span className="truncate">{prevDoc.title}</span>
					</NavButton>
				)}
			</div>
			<div className="max-w-[50%] min-w-0">
				{nextDoc && (
					<NavButton href={`/learn/${level}/${nextDoc.relativeUrl}`}>
						<span className="truncate">{nextDoc.title}</span>
						<NextIcon className="w-4 h-4 shrink-0" />
					</NavButton>
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
