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
) => {
	const session = await auth();
	const ctx = KSwithSession(session);
	await ctx.query.DictItem.createMany({
		data: dictItems.map(
			(w) =>
				({
					name: w.name,
					trans: w.trans,
					example: w.example,
					exTrans: w.exTrans,
					dict: { connect: { id: dictId } },
					createdBy: { connect: { id: session?.user?.id } },
				}) as unknown as DictItemCreateInput,
		),
	});
};

const addWordsToUserDictAction = async (dictId: string, words: string[]) => {
	const dictItems = await generateWordsAction(words);
	await addDictItemToDictAction(dictId, dictItems);
	revalidateTag(getDictRevalidateKey(dictId));
};

const getDictList = async (dictId: string) => {
	// TODO: 权限做 增删改
	const ctx = keystoneContext.sudo();
	const res = (await ctx.query.Dict.findOne({
		where: { id: dictId },
		query: "list { id name trans example exTrans }",
	})) as { list: Dict } | null;
	return toPlainObject(res?.list || []);
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
