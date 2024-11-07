import { join } from "node:path";
import { Levels } from "@/types";
import {
	type FileItem,
	_listAllDocs as _listAllDocsByLevel,
} from "@/utils/list-docs";

export async function flattenAllDocs() {
	const levels = [Levels.Beginner, Levels.Intermediate];

	return (
		await Promise.all(levels.map((level) => listAllDocsByLevel(level)))
	).flat();
}

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
				...(doc as FileItem),
				path: join(process.cwd(), "mdx", level, (doc as FileItem).relativePath),
				level,
			} as {
				title: string;
				path: string;
				level: Levels;
				content?: string;
			} & FileItem;
		});
	return flattenDocs;
}

export function insertOrUpdateFrontmatterKey(
	docString: string,
	frontmatterKey: string,
	content: string,
) {
	const frontmatterReg = new RegExp(`${frontmatterKey}:(.*)`);
	const hasFrontmatterKey = docString.match(frontmatterReg)?.[1];

	if (hasFrontmatterKey !== undefined) {
		const newDocString = docString.replace(
			frontmatterReg,
			`${frontmatterKey}: ${content}`,
		);
		return newDocString;
	}
	const newDocString = docString.replace(
		/---([\s\S]*?)---/,
		`---$1${frontmatterKey}: ${content}\n---`,
	);
	return newDocString;
}
