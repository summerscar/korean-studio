import type { DocPathParams, Levels } from "@/types";
import { type FileItem, type SubDirItem, listAllDocs } from "@/utils/list-docs";
import clsx from "clsx";
import Link from "next/link";

const DocsCategory = async ({ doc_path }: DocPathParams) => {
	const level = doc_path[0] as Levels;
	const docs = await listAllDocs(level);
	const formattedTitle =
		doc_path.length > 1 ? decodeURIComponent(doc_path?.pop() || "") : "";

	const buildTree = (docs: (FileItem | SubDirItem)[], path: string[] = []) => {
		return docs.map((doc) => {
			if ("children" in doc) {
				return (
					<li key={doc.title}>
						<details open>
							<summary>{doc.title}</summary>
							<ul>{buildTree(doc.children, [...path, doc.title])}</ul>
						</details>
					</li>
				);
			}
			const docFileTitle = doc.file.replace(/\.mdx?/, "");
			return (
				<li key={doc.title}>
					<Link
						href={`/${path.join("/")}/${docFileTitle}`}
						className={clsx("flex", {
							active: formattedTitle === docFileTitle,
						})}
					>
						{doc.title}
					</Link>
				</li>
			);
		});
	};
	return (
		<ul className="menu">
			<li>
				<Link
					className={clsx("flex", { active: !formattedTitle })}
					href={`/learn/${level}`}
				>
					{/* TODO: i18n */}
					介绍
				</Link>
			</li>
			{buildTree(docs, ["learn", level])}
		</ul>
	);
};
export { DocsCategory };
