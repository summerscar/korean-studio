import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { DocsTitleParams, LevelParams } from "@/types";
import clsx from "clsx";
import Link from "next/link";

let listAllDocs = async (level: string) => {
	const root = path.resolve();
	const mdxDir = path.join(root, "mdx", level);
	const docs = await readdir(mdxDir);
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

	// 暂时用惰性函数救一下吧，后面用 postinstall 跑脚本？
	// biome-ignore lint/correctness/noUnusedVariables: <explanation>
	listAllDocs = async (level) => sortedDocs;
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
		<ul>
			<li className="my-2">
				<Link className="flex" href={`/learn/${level}`}>
					Intro {level}
				</Link>
			</li>
			{docs.map((doc) => (
				<li
					key={doc}
					className={clsx("my-2", {
						"bg-[var(--fallback-bc,oklch(var(--bc)/0.1))]": title === doc,
					})}
				>
					<Link className="flex" href={`/learn/${level}/${doc}`}>
						{doc}
					</Link>
				</li>
			))}
		</ul>
	);
};
export { DocsCategory };
