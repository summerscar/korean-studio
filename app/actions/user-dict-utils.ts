import { isAdminBySession } from "@/hooks/use-user";
import type { UserDicts } from "@/types/dict";
import type { Session } from "next-auth";
import { unstable_cache } from "next/cache";
import { getDictList } from "./user-dict-action";

export const getDictRevalidateKey = (dictId: string) => `dict-${dictId}`;

const createCachedDictList = (dictId: string) => {
	return unstable_cache(
		async () => getDictList(dictId),
		[`getDictList-${dictId}`],
		{ revalidate: false, tags: [getDictRevalidateKey(dictId)] },
	);
};

const filterAndSortDictList = (
	dictList: UserDicts,
	session: Session | null,
) => {
	return dictList
		.filter((dict) => {
			return (
				isAdminBySession(session) ||
				dict.public ||
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

export { createCachedDictList, filterAndSortDictList };
