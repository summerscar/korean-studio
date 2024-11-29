"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAllDicts } from "./user-dict-action";
import {
	allDictsRevalidateKey,
	getDictRevalidateKey,
	getFavDictRevalidateKey,
	isFavDict,
} from "./user-dict-utils";

const clearCacheAction = async (path: string) => {
	const targetPath = path || "/";
	console.log("[clean-cache][path]: ", targetPath);

	// 清除路由缓存
	revalidatePath(targetPath, "layout");

	// 清除字典列表缓存
	revalidateTag(allDictsRevalidateKey);

	// 清除所有字典内容的缓存
	const dictList = await getAllDicts();
	for (const dict of dictList) {
		revalidateTag(getDictRevalidateKey(dict.id));
		if (isFavDict(dict)) {
			revalidateTag(getFavDictRevalidateKey(dict.id));
		}
	}
};

export { clearCacheAction };
