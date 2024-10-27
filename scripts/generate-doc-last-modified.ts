import { exec, execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { flattenAllDocs, insertOrUpdateFrontmatterKey } from "./list-all-docs";

(async () => {
	const stagedDocs = process.argv.slice(2);
	console.log("[generate-doc-last-modified]: start...");
	console.log("[generate-doc-last-modified][staged docs]: ", stagedDocs);
	const docs = await flattenAllDocs();
	const docsWithLastModification = docs
		.filter((doc) => stagedDocs.includes(doc.path))
		.map((doc) => {
			const timeStamp = String(new Date().getTime());
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
				Number(doc.lastModified),
			).toLocaleString()}`,
		);
	});
	console.log("[generate-doc-last-modified]: finish...");
})();
