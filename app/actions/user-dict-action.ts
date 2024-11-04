"use server";
import { keystoneContext } from "@/../keystone/context";
import type { UserDicts } from "@/types/dict";
import { toPlainObject } from "@/utils/to-plain-object";
import { auth } from "auth";

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
};

const getUserDicts = async () => {
	const sudoContext = keystoneContext.sudo();
	const session = await auth();
	if (!session?.user) {
		return [];
	}
	const res = (await sudoContext.query.Dict.findMany({
		where: { createdBy: { id: { equals: session.user.id } } },
		query: "id name list { id name }",
	})) as UserDicts;

	return toPlainObject(res);
};

export { createDictAction, getUserDicts };
