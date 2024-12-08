import { keystoneContext } from "@/../keystone/context";
import { allArticlesRevalidateKey } from "@/actions/user-dict-utils";
import { unstable_cache } from "next/cache";

const getArticles = unstable_cache(
	async () => {
		return await keystoneContext.db.Article.findMany({
			where: {},
			orderBy: { createdAt: "desc" },
		});
	},
	[allArticlesRevalidateKey],
	{ revalidate: false, tags: [allArticlesRevalidateKey] },
);

export { getArticles };
