import { existsSync, lstatSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path, { resolve } from "node:path";
import { unstable_cache } from "next/cache";

export interface DirItem {
	date: string;
	title: string;
}

export interface FileItem extends DirItem {
	/** filename.md */
	file: string;
	/** filename */
	fileName: string;
	/** /语法形态/filename */
	relativePath: string;
	/** /语法形态/filename.md */
	relativeUrl: string;
	/** /语法形态/titleName.md */
	relativeReadablePath: string;
}
export interface SubDirItem extends DirItem {
	children: (SubDirItem | FileItem)[];
}

const DIR_ORDER = {
	文字与发音: "1",
	语法基础: "2",
	语法形态: "3",
	单词构成: "4",
	特殊规则: "5",
};

const CACHE_KEY = `list-docs-${process.env.VERCEL_GIT_COMMIT_SHA || "dev"}`;

const _listAllDocs = async (level: string) => {
	const root = path.resolve();
	const mdxDir = path.join(root, "mdx", level);

	const walkDir = async (
		dir: string,
		walkPath: string[] = [],
	): Promise<(FileItem | SubDirItem)[]> => {
		const files = (existsSync(dir) ? await readdir(dir) : [])
			.filter(
				// filter out hidden files
				(doc) =>
					!doc.startsWith("_") &&
					!lstatSync(resolve(dir, doc)).isDirectory() &&
					(doc.endsWith(".mdx") || doc.endsWith(".md")),
			)
			.map((doc) => doc.normalize("NFC"));

		const subDirs = (existsSync(dir) ? await readdir(dir) : []).filter((doc) =>
			lstatSync(resolve(dir, doc)).isDirectory(),
		);

		const data = await Promise.all(
			files.map(async (file) => {
				const filePath = path.join(dir, file);
				const data = await readFile(filePath, { encoding: "utf-8" });
				const fileName = file.replace(/\.mdx?/, "");
				const title = data.match(/title: (.*)/)?.[1] || fileName;
				return {
					file: file,
					fileName,
					relativeUrl: path.join(...walkPath, fileName),
					relativePath: path.join(...walkPath, file),
					relativeReadablePath: path.join(...walkPath, title),
					title,
					date: data.match(/date: (.*)/)?.[1] || "0",
				} as FileItem;
			}),
		);

		const subData = await Promise.all(
			subDirs.map(async (subDir) => {
				const filePath = path.join(dir, subDir);
				return {
					title: subDir,
					children: await walkDir(filePath, [...walkPath, subDir]),
					date: DIR_ORDER[subDir as keyof typeof DIR_ORDER] || "0",
				} as SubDirItem;
			}),
		);

		const tree = [...data, ...subData].sort(
			(a, b) => Date.parse(a.date) - Date.parse(b.date),
		);

		return tree;
	};

	const docs = await walkDir(mdxDir);

	return docs;
};

const listAllDocs = unstable_cache(_listAllDocs, [CACHE_KEY]);

export { listAllDocs, _listAllDocs };
