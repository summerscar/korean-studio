import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
	type FileItem,
	_listAllDocs as _listAllDocsByLevel,
} from "@/utils/list-docs";

(async () => {
	const DESC_MIN_LENGTH = 10;
	const levels = ["beginner", "intermediate"];
	const docs = (
		await Promise.all(levels.map((level) => listAllDocsByLevel(level)))
	).flat();
	// console.log("[generate-doc-desc]: \n", docs);
	// 筛序出文档中的 frontmatter 的 description 部分少于 DESC_MIN_LENGTH 个字的
	const docsNeedToGenerateDescription = docs.filter((doc) => {
		const docString = readFileSync(doc.path, "utf-8");
		const description = docString.match(/description: (.*)/)?.[1];
		return description && description.length < DESC_MIN_LENGTH;
	});

	console.log(
		"[generate-doc-desc]: \n",
		docsNeedToGenerateDescription,
		"\namount: ",
		docsNeedToGenerateDescription.length,
	);
})();

async function listAllDocsByLevel(level: string) {
	const docs = await _listAllDocsByLevel(level);
	const flattenDocs = docs
		.flatMap((doc) => {
			if ("children" in doc) {
				return doc.children;
			}
			return doc;
		})
		.map((doc) => {
			return {
				title: doc.title,
				path: join(process.cwd(), "mdx", level, (doc as FileItem).relativePath),
			};
		});
	return flattenDocs;
}
