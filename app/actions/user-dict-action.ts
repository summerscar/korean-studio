"use server";
import { KSwithSession, keystoneContext } from "@/../keystone/context";
import type { Dict, DictItem, UserDicts } from "@/types/dict";
import { FAV_LIST_KEY } from "@/utils/config";
import { toPlainObject } from "@/utils/to-plain-object";
import { auth } from "auth";
import { revalidateTag, unstable_cache } from "next/cache";
import { generateWordsAction } from "./generate-word-action";
import {
	allDictsRevalidateKey,
	getDictRevalidateKey,
	getFavDictRevalidateKey,
	isFavDict,
} from "./user-dict-utils";
import type { DictItemCreateInput, DictUpdateInput } from ".keystone/types";

const getAllDicts = unstable_cache(
	async () => {
		const sudoContext = keystoneContext.sudo();
		const res = (await sudoContext.query.Dict.findMany({
			where: {},
			query: "id name public intlKey poster createdBy { id name }",
			orderBy: { createdAt: "asc" },
		})) as UserDicts;
		return toPlainObject(res);
	},
	["getAllDicts"],
	{ revalidate: false, tags: [allDictsRevalidateKey] },
);

const createDictAction = async (dictName: string) => {
	const sudoContext = keystoneContext.sudo();
	const session = await auth();
	if (!session?.user) {
		throw new Error("no session");
	}
	const res = await sudoContext.db.Dict.createOne({
		data: {
			name: dictName,
			createdBy: {
				connect: { id: session.user.id },
			},
		},
	});
	revalidateTag(allDictsRevalidateKey);

	return res;
};

const createFavListAction = async (userName: string, userId: string) => {
	const sudoContext = keystoneContext.sudo();
	const res = await sudoContext.db.Dict.createOne({
		data: {
			name: `${userName}'s ${FAV_LIST_KEY}`,
			intlKey: FAV_LIST_KEY,
			createdBy: {
				connect: { id: userId },
			},
		},
	});
	revalidateTag(allDictsRevalidateKey);
	return res;
};

const _getFavListID = async (userId: string) => {
	const favDict = (await getAllDicts()).find(
		(_) => _.createdBy.id === userId && isFavDict(_),
	) as UserDicts[0];
	return favDict.id;
};

/**
 * 获取收藏列表
 * @param targetDictId 用于非本人获取
 * @returns
 */
const getFavListAction = async (targetDictId?: string) => {
	const session = await auth();
	if (!session?.user) {
		return [];
	}
	const dictId = targetDictId || (await _getFavListID(session.user?.id!));
	const res = await unstable_cache(
		async () => {
			const res = await KSwithSession(session).query.DictItemFavorite.findMany({
				where: { dict: { id: { equals: dictId } } },
				query: "item { id name trans example exTrans }",
				orderBy: { favoritedAt: "asc" },
			});
			return res.map((_) => _.item) as Dict;
		},
		[getFavDictRevalidateKey(dictId)],
		{ revalidate: false, tags: [getFavDictRevalidateKey(dictId)] },
	)();
	return toPlainObject(res);
};

/**
 * 管理收藏
 * @param dictItemId
 * @param isAdd
 * @param targetDictId 用于非本人操作时，指定目标收藏夹
 */
const toggleDictItemIdToFavListAction = async (
	dictItemId: string,
	isAdd: boolean,
	targetDictId?: string,
) => {
	const session = await auth();
	if (!session?.user) {
		throw new Error("no session");
	}
	const dictId = targetDictId || (await _getFavListID(session.user?.id!));

	const ctx = KSwithSession(session);
	await ctx.db.Dict.updateOne({
		where: { id: dictId },
		data: {
			list: {
				[isAdd ? "connect" : "disconnect"]: { id: dictItemId },
			},
		},
	});
	if (isAdd) {
		// 添加到收藏，会自动记录时间戳
		await ctx.db.DictItemFavorite.createOne({
			data: {
				dict: { connect: { id: dictId } },
				item: { connect: { id: dictItemId } },
			},
		});
	} else {
		// 从收藏中移除
		const dictItemFavorite = (
			await ctx.db.DictItemFavorite.findMany({
				where: {
					AND: [
						{ dict: { id: { equals: dictId } } },
						{ item: { id: { equals: dictItemId } } },
					],
				},
			})
		)[0];
		dictItemFavorite &&
			(await ctx.db.DictItemFavorite.deleteOne({
				where: { id: dictItemFavorite.id },
			}));
	}
	revalidateTag(getFavDictRevalidateKey(dictId));
};

const removeDictItemAction = async (dictId: string, dictItemId: string) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.db.Dict.updateOne({
		where: { id: dictId },
		data: {
			list: {
				disconnect: { id: dictItemId },
			},
		},
	});
	revalidateTag(getDictRevalidateKey(dictId));
};

const addDictItemToDictAction = async (
	dictId: string,
	dictItems: DictItem[],
	userId = "",
) => {
	const session = await auth();
	const ctx = KSwithSession(session || { user: { id: userId }, expires: "" });

	await ctx.db.DictItem.createMany({
		data: dictItems.map(
			(w) =>
				({
					name: w.name,
					trans: w.trans,
					example: w.example,
					exTrans: w.exTrans,
					dict: { connect: { id: dictId } },
					createdBy: { connect: { id: session?.user?.id || userId } },
				}) as unknown as DictItemCreateInput,
		),
	});
};

const addWordsToUserDictAction = async (
	dictId: string,
	words: string[],
	userId = "",
) => {
	const dictItems = await generateWordsAction(words);
	await addDictItemToDictAction(dictId, dictItems, userId);
	revalidateTag(getDictRevalidateKey(dictId));
};

const updateDictItemAction = async (
	dictId: string,
	dictItemId: string,
	data: DictItem,
) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.db.DictItem.updateOne({
		where: { id: dictItemId },
		data: {
			name: data.name,
			trans: data.trans,
			example: data.example,
			exTrans: data.exTrans,
		} as unknown as DictItemCreateInput,
	});
	revalidateTag(getDictRevalidateKey(dictId));
};

const updateDictAction = async (dictId: string, data: DictUpdateInput) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.db.Dict.updateOne({
		where: { id: dictId },
		data,
	});
	revalidateTag(allDictsRevalidateKey);
	// revalidateTag(getDictRevalidateKey(dictId));
};

const getDictList = async (dictId: string) => {
	// TODO: 权限做 增删改
	const ctx = keystoneContext.sudo();
	const res = (await ctx.query.DictItem.findMany({
		where: { dict: { some: { id: { equals: dictId } } } },
		query: "id name trans example exTrans",
		orderBy: { createdAt: "asc" },
	})) as Dict;
	return toPlainObject(res);
};

const getCachedDictList = (dictId: string) => {
	return unstable_cache(
		async () => getDictList(dictId),
		[`getDictList-${dictId}`],
		{ revalidate: false, tags: [getDictRevalidateKey(dictId)] },
	)();
};

const getFavOrDictList = async (dictId: string) => {
	const dicts = await getAllDicts();
	const dict = dicts.find((_) => _.id === dictId);
	if (isFavDict(dict)) {
		return getFavListAction(dictId);
	}
	return getCachedDictList(dictId);
};

const importDictItemToUserDict = async (dictId: string, JSONString: string) => {
	await addDictItemToDictAction(dictId, JSON.parse(JSONString));
	revalidateTag(getDictRevalidateKey(dictId));
};

const removeDictAction = async (dictId: string) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.db.Dict.deleteOne({ where: { id: dictId } });
	revalidateTag(allDictsRevalidateKey);
	revalidateTag(getDictRevalidateKey(dictId));
};

const refreshDictAction = async (dictId: string) => {
	revalidateTag(getDictRevalidateKey(dictId));
};

const getDictItemsByUserAction = async (userId: string) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	const res = await ctx.query.DictItem.findMany({
		where: {
			createdBy: { id: { equals: userId } },
			dict: { some: { id: { not: null } } },
		},
		query: "id name",
	});
	// TODO: 收藏中的单词
	return toPlainObject(res) as DictItem[];
};

export {
	createDictAction,
	createFavListAction,
	getAllDicts,
	getCachedDictList,
	getFavOrDictList,
	getDictList,
	getFavListAction,
	addWordsToUserDictAction,
	toggleDictItemIdToFavListAction,
	updateDictItemAction,
	updateDictAction,
	removeDictItemAction,
	removeDictAction,
	importDictItemToUserDict,
	refreshDictAction,
	getDictItemsByUserAction,
};
