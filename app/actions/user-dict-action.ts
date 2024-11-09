"use server";
import { KSwithSession, keystoneContext } from "@/../keystone/context";
import type { Dict, DictItem, UserDicts } from "@/types/dict";
import { toPlainObject } from "@/utils/to-plain-object";
import { auth } from "auth";
import { revalidateTag, unstable_cache } from "next/cache";
import { generateWordsAction } from "./generate-word-action";
import { getDictRevalidateKey } from "./user-dict-utils";
import type { DictItemCreateInput } from ".keystone/types";

const allDictsRevalidateKey = "all-dicts";

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
	const res = (await sudoContext.query.Dict.createOne({
		data: {
			name: dictName,
			createdBy: {
				connect: { id: session.user.id },
			},
		},
	})) as UserDicts[0];
	revalidateTag(allDictsRevalidateKey);

	return toPlainObject(res);
};

const removeDictItemAction = async (dictId: string, dictItemId: string) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.query.Dict.updateOne({
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

	await ctx.query.DictItem.createMany({
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
	if (!dictItems.length) {
		throw new Error("No words generated");
	}
	await addDictItemToDictAction(dictId, dictItems, userId);
	revalidateTag(getDictRevalidateKey(dictId));
	if (dictItems.length !== words.length) {
		throw new Error("Partially generated, not all words added");
	}
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
	await ctx.query.Dict.deleteOne({ where: { id: dictId } });
	revalidateTag(allDictsRevalidateKey);
	revalidateTag(getDictRevalidateKey(dictId));
};

export {
	createDictAction,
	getAllDicts,
	getDictList,
	addWordsToUserDictAction,
	removeDictItemAction,
	removeDictAction,
	importDictItemToUserDict,
};
