import { exec, execSync } from "node:child_process";
import { flattenAllDocs } from "./generate-doc-desc";

(async () => {
	const docs = await flattenAllDocs();
	const docsWithLastModification = docs.map((doc) => {
		const timeStamp = execSync(
			`git log -1 --pretty="format:%ct" -- "${doc.path}"`,
		).toString("utf-8");
		return {
			...doc,
			lastModification: timeStamp,
		};
	});
	console.log("[generate-doc-last-modification]: \n", docsWithLastModification);
})();
