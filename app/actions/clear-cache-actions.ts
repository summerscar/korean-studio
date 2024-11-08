"use server";

import { revalidatePath } from "next/cache";

const clearCacheAction = async (path: string) => {
	const targetPath = path || "/";
	console.log("[clean-cache][path]: ", targetPath);
	revalidatePath(targetPath, targetPath.match(/\[.*\]/) ? "page" : undefined);
};

export { clearCacheAction };
