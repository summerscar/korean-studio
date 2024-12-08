import { getAllDicts } from "@/actions/user-dict-action";
import { filterAndSortDictList, isFavDict } from "@/actions/user-dict-utils";
import type { UserDicts } from "@/types/dict";
import { useSession } from "next-auth/react";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

const allDictsRevalidateKey = "all-dicts";

const refreshDictList = async () => {
	mutate(allDictsRevalidateKey);
};

const useDictList = () => {
	const { data: dictList } = useSWRImmutable<UserDicts>(
		allDictsRevalidateKey,
		async () => {
			const allDicts = await getAllDicts();
			return allDicts;
		},
	);
	return dictList || [];
};

const useUserDictList = ({ filterFav = false }: { filterFav?: boolean }) => {
	const { data: session } = useSession();
	const dictList = useDictList();

	const list = filterAndSortDictList(dictList, session, false).filter((dict) =>
		filterFav ? !isFavDict(dict) : true,
	);
	return list;
};

export { useDictList, refreshDictList, useUserDictList };
