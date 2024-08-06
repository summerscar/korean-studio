import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { DocsTitleParams, LevelParams } from "@/types";
import clsx from "clsx";
import Link from "next/link";

const __docs_store = new Map<string, string[]>();

export const listAllDocs = async (level: string) => {
	if (__docs_store.has(level)) {
		return __docs_store.get(level)!;
	}

	const root = path.resolve();
	const mdxDir = path.join(root, "mdx", level);
	const docs = (existsSync(mdxDir) ? await readdir(mdxDir) : []).filter(
		// filter out hidden files
		(doc) => !doc.startsWith("_"),
	);
	const docsData = await Promise.all(
		docs.map(async (doc) => {
			const filePath = path.join(mdxDir, doc);
			const data = await readFile(filePath, { encoding: "utf-8" });
			return data;
		}),
	);

	const docsDate = await Promise.all(
		docsData.map((doc) => doc.match(/date: (\d{4}-\d{2}-\d{2})/)?.[1] || "0"),
	);

	// sort docsData with docsDates
	const sortedDocsDate = [...docsDate].sort(
		(a, b) => Date.parse(a) - Date.parse(b),
	);
	const sortedDocs = sortedDocsDate.map((date) => docs[docsDate.indexOf(date)]);
	__docs_store.set(level, sortedDocs);
	return sortedDocs;
};

const DocsCategory = async ({
	level,
	title,
}: LevelParams & Partial<DocsTitleParams>) => {
	const docs = (await listAllDocs(level)).map((doc) =>
		doc.replace(/\.mdx?/, ""),
	);

	return (
		<ul className="menu">
			<li>
				<Link
					className={clsx("flex", { active: !title })}
					href={`/learn/${level}`}
				>
					Intro {level}
				</Link>
			</li>
			{docs.map((doc) => (
				<li key={doc}>
					<Link
						className={clsx("flex", { active: title === doc })}
						href={`/learn/${level}/${doc}`}
					>
						{doc}
					</Link>
				</li>
			))}
		</ul>
	);
};
export { DocsCategory };
