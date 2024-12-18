import { keystoneContext } from "@/../keystone/context";
import { allArticlesRevalidateKey } from "@/actions/user-dict-utils";
import { unstable_cache } from "next/cache";

const getArticles = unstable_cache(
	async () => {
		return await keystoneContext.db.Article.findMany({
			where: {},
			orderBy: { createdAt: "desc" },
			take: 36,
		});
	},
	[allArticlesRevalidateKey],
	{ revalidate: 60 * 60 * 24, tags: [allArticlesRevalidateKey] },
);

export { getArticles };
