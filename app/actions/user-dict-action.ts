"use server";
import { KSwithSession, keystoneContext } from "@/../keystone/context";
import type { Dict, DictItem, UserDicts } from "@/types/dict";
import { toPlainObject } from "@/utils/to-plain-object";
import { auth } from "auth";
import type { Session } from "next-auth";
import { revalidateTag, unstable_cache } from "next/cache";
import { generateWordsAction } from "./generate-word-action";
import type { DictItemCreateInput } from ".keystone/types";

const allDictsRevalidateKey = "all-dicts";
const getDictRevalidateKey = (dictId: string) => `dict-${dictId}`;

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
	await sudoContext.query.Dict.createOne({
		data: {
			name: dictName,
			createdBy: {
				connect: { id: session.user.id },
			},
		},
	});
	revalidateTag(allDictsRevalidateKey);
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

const getDictList = async (dictId: string, session: Session | null) => {
	// TODO: 权限
	const ctx = KSwithSession(session);

	const res = (await ctx.query.Dict.findOne({
		where: { id: dictId },
		query: "list { id name trans example exTrans }",
	})) as { list: Dict };
	return toPlainObject(res.list);
};

const createCachedDictList = (dictId: string) => {
	return unstable_cache(
		async (dictId: string, session: Session | null) =>
			getDictList(dictId, session),
		[`getDictList-${dictId}`],
		{ revalidate: false, tags: [getDictRevalidateKey(dictId)] },
	);
};

const importDictItemToUserDict = async (dictId: string, JSONString: string) => {
	await addDictItemToDictAction(dictId, JSON.parse(JSONString));
	revalidateTag(getDictRevalidateKey(dictId));
};

export {
	createDictAction,
	getAllDicts,
	getDictList,
	createCachedDictList,
	addWordsToUserDictAction,
	removeDictItemAction,
	importDictItemToUserDict,
};
