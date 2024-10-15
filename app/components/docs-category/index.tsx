import { existsSync, lstatSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path, { resolve } from "node:path";
import type { DocPathParams, Levels } from "@/types";
import { isDev } from "@/utils/is-dev";
import clsx from "clsx";
import Link from "next/link";

interface DirItem {
	date: string;
	title: string;
}

export interface FileItem extends DirItem {
	file: string;
	relativePath: string;
}
interface SubDirItem extends DirItem {
	children: (SubDirItem | FileItem)[];
}

const __docs_store = new Map<string, (FileItem | SubDirItem)[]>();

export const listAllDocs = async (level: string) => {
	if (__docs_store.has(level) && !isDev) {
		return __docs_store.get(level)!;
	}

	const root = path.resolve();
	const mdxDir = path.join(root, "mdx", level);

	const walkDir = async (
		dir: string,
		walkPath: string[] = [],
	): Promise<(FileItem | SubDirItem)[]> => {
		const files = (existsSync(dir) ? await readdir(dir) : []).filter(
			// filter out hidden files
			(doc) =>
				!doc.startsWith("_") &&
				!lstatSync(resolve(dir, doc)).isDirectory() &&
				(doc.endsWith(".mdx") || doc.endsWith(".md")),
		);

		const subDirs = (existsSync(dir) ? await readdir(dir) : []).filter((doc) =>
			lstatSync(resolve(dir, doc)).isDirectory(),
		);

		const data: FileItem[] = await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(dir, file);
				const data = await readFile(filePath, { encoding: "utf-8" });

				return {
					file: file,
					relativePath: path.join(...walkPath, file),
					title: data.match(/title: (.*)/)?.[1] || file,
					date: data.match(/date: (\d{4}-\d{2}-\d{2})/)?.[1] || "0",
				};
			}),
		);

		const subData = await Promise.all(
			subDirs.map(async (subDir) => {
				const filePath = path.join(dir, subDir);
				return {
					title: subDir,
					children: await walkDir(filePath, [...walkPath, subDir]),
					date: "0",
				} as SubDirItem;
			}),
		);

		const tree = [...data, ...subData].sort(
			(a, b) => Date.parse(a.date) - Date.parse(b.date),
		);

		return tree;
	};

	const docs = await walkDir(mdxDir);
	__docs_store.set(level, docs);
	return docs;
};

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
