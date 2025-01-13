"use server";
import { keystoneContext } from "@/../keystone/context";
import {
	allArticlesRevalidateKey,
	articlePageSize,
	getPageArticlesRevalidateKey,
} from "@/actions/user-dict-utils";
import { revalidateTag, unstable_cache } from "next/cache";

const getArticles = (page = 1) =>
	unstable_cache(
		async () => {
			return await keystoneContext.db.Article.findMany({
				where: {},
				orderBy: { createdAt: "desc" },
				take: articlePageSize,
				skip: (page - 1) * articlePageSize,
			});
		},
		[getPageArticlesRevalidateKey(page)],
		{
			revalidate: 60 * 60 * 24,
			tags: [getPageArticlesRevalidateKey(page), allArticlesRevalidateKey],
		},
	)();

const getArticlesWithPagination = async (page = 1) => {
	const total = await keystoneContext.db.Article.count();
	const articles = await getArticles(page);
	const totalPages = Math.ceil(total / articlePageSize);
	return { total, totalPages, articles } as const;
};

const removeArticleAction = async (id: string) => {
	await keystoneContext.db.Article.deleteOne({ where: { id } });
	revalidateTag(allArticlesRevalidateKey);
};

export { getArticles, removeArticleAction, getArticlesWithPagination };
