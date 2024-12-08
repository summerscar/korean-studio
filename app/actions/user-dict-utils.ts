import { isAdminBySession } from "@/hooks/use-user";
import type { UserDicts } from "@/types/dict";
import { FAV_LIST_KEY } from "@/utils/config";
import type { Session } from "next-auth";

export const getDictRevalidateKey = (dictId: string) => `dict-${dictId}`;
export const allDictsRevalidateKey = "all-dicts";
export const getFavDictRevalidateKey = (dictId: string) => `fav-dict-${dictId}`;

export const allArticlesRevalidateKey = "articles";
export const getArticleRevalidateKey = (articleId: string) =>
	`article-${articleId}`;
export const articleRevalidateKey = "article";

export const isFavDict = (dict?: UserDicts[0]) =>
	dict?.intlKey === FAV_LIST_KEY;

const filterAndSortDictList = (
	dictList: UserDicts,
	session: Session | null,
	includePublic = true,
) => {
	return dictList
		.filter((dict) => {
			return (
				isAdminBySession(session) ||
				(includePublic ? dict.public : false) ||
				dict.createdBy.id === session?.user?.id
			);
		})
		.sort((a, b) => {
			if (a.public && !b.public) {
				return -1;
			}
			if (!a.public && b.public) {
				return 1;
			}
			return 0;
		});
};

export { filterAndSortDictList };
