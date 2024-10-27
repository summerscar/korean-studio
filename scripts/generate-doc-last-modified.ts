import { exec, execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { flattenAllDocs, insertOrUpdateFrontmatterKey } from "./list-all-docs";

(async () => {
	const docs = await flattenAllDocs();
	const docsWithLastModification = docs.map((doc) => {
		const timeStamp = execSync(
			`git log -1 --pretty="format:%at" "${doc.path}"`,
		).toString("utf-8");
		return {
			...doc,
			lastModified: timeStamp,
		};
	});
	docsWithLastModification.forEach((doc) => {
		const docString = readFileSync(doc.path, "utf-8");
		const frontmatterKey = "last-modified";
		const newDocString = insertOrUpdateFrontmatterKey(
			docString,
			frontmatterKey,
			doc.lastModified,
		);
		writeFileSync(doc.path, newDocString);
		console.log(
			`[generate-doc-last-modified]: ${doc.title} -> ${frontmatterKey}: ${doc.lastModified} ${new Date(
				Number(doc.lastModified) * 1000,
			).toLocaleString()}`,
		);
	});
	// console.log("[generate-doc-last-modification]: \n", docsWithLastModification);
})();
