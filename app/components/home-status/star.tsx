import {
	getFavListAction,
	toggleDictItemIdToFavListAction,
} from "@/actions/user-dict-action";
import StarIcon from "@/assets/svg/star.svg";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { useUser } from "@/hooks/use-user";
import type { Dict, DictItem } from "@/types/dict";
import { FAV_LIST_KEY } from "@/utils/config";
import { isDev } from "@/utils/is-dev";
import clsx from "clsx";
import { signIn } from "next-auth/react";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";
const Star = ({
	dictItem,
	isLocalDict,
}: { dictItem: DictItem | null; isLocalDict: boolean }) => {
	const isStarred = useStarred(dictItem);
	const { isLogin } = useUser();
	const [pending, toggle] = useServerActionState(
		toggleDictItemIdToFavListAction,
	);

	const toggleFavorite = async () => {
		if (!dictItem || pending) return;
		if (!isLogin) {
			signIn();
			return;
		}
		await mutate(
			FAV_LIST_KEY,
			async () => {
				isDev && console.time("[toggleFavorite]");
				await toggle(dictItem.id!, !isStarred);
				const res = await fetcher();
				isDev && console.timeEnd("[toggleFavorite]");
				return res;
			},
			{
				optimisticData: (prev: Dict | undefined) => {
					if (isStarred) {
						return (prev || []).filter((item) => item.id !== dictItem.id);
					}
					return [...(prev || []), dictItem];
				},
				rollbackOnError: true,
			},
		);
	};

	if (!dictItem || isLocalDict) return null;

	return (
		<StarIcon
			className={clsx(
				isStarred ? "fill-current" : "",
				"cursor-pointer absolute top-6 -right-7 size-5 transition-all",
			)}
			onClick={toggleFavorite}
		/>
	);
};

const fetcher = () => {
	return getFavListAction();
};

const useFavList = () => {
	const { data } = useSWRImmutable(FAV_LIST_KEY, fetcher);

	if (!data) return [];
	return data;
};

const useStarred = (dictItem: DictItem | null) => {
	const favList = useFavList();
	if (!favList || !dictItem) return false;
	return !!favList.find((item) => item.id === dictItem.id);
};

export { Star, useStarred };
