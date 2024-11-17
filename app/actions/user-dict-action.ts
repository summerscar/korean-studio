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
	createCachedDictList,
	getDictRevalidateKey,
} from "./user-dict-utils";
import type { DictItemCreateInput, DictUpdateInput } from ".keystone/types";

const getAllDicts = unstable_cache(
	async () => {
		const sudoContext = keystoneContext.sudo();
		const res = (await sudoContext.query.Dict.findMany({
			where: {},
			query: "id name public intlKey createdBy { id name }",
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
		(_) => _.createdBy.id === userId && _.intlKey === FAV_LIST_KEY,
	) as UserDicts[0];
	return favDict.id;
};

const getFavListAction = async () => {
	const session = await auth();
	if (!session?.user) {
		return [];
	}

	const res = await createCachedDictList(
		await _getFavListID(session.user.id!),
	)();
	return toPlainObject(res);
};

const toggleDictItemIdToFavListAction = async (
	dictItemId: string,
	isAdd: boolean,
) => {
	const session = await auth();
	if (!session?.user) {
		throw new Error("no session");
	}
	const dictId = await _getFavListID(session.user?.id!);

	const ctx = KSwithSession(session);
	await ctx.db.Dict.updateOne({
		where: { id: dictId },
		data: {
			list: {
				[isAdd ? "connect" : "disconnect"]: { id: dictItemId },
			},
		},
	});
	revalidateTag(getDictRevalidateKey(dictId));
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

export {
	createDictAction,
	createFavListAction,
	getAllDicts,
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
};
