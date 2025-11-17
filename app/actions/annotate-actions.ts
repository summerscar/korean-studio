"use server";
import type {
	AnnotationCreateInput,
	AnnotationOrderByInput,
	AnnotationUpdateInput,
} from ".keystone/types";
import { auth } from "auth";
import { KSwithSession } from "@/../keystone/context";
import type { AnnotationItem } from "@/types/annotation";

const listAnnotationAction = async ({
	articleId,
	chapterId,
	take = undefined,
	orderBy = undefined,
}: {
	articleId?: string;
	chapterId?: string;
	take?: number;
	orderBy?: AnnotationOrderByInput;
}) => {
	const session = await auth();
	const userId = session?.user?.id;
	if (!userId) {
		return [];
	}
	const res = (await KSwithSession(session).db.Annotation.findMany({
		where: {
			createdBy: { id: { equals: userId } },
			...(articleId ? { articleId: { id: { equals: articleId } } } : null),
			...(chapterId ? { chapterId: { equals: chapterId } } : null),
		},
		take,
		...(orderBy ? { orderBy } : {}),
	})) as AnnotationItem[];

	return res;
};

const listAnnotationActionWithArticle = async ({
	articleId,
	chapterId,
	take = undefined,
	orderBy = undefined,
}: {
	articleId?: string;
	chapterId?: string;
	take?: number;
	orderBy?: AnnotationOrderByInput;
}) => {
	const session = await auth();
	const userId = session?.user?.id;
	if (!userId) {
		return [];
	}
	const res = (await KSwithSession(session).query.Annotation.findMany({
		where: {
			createdBy: { id: { equals: userId } },
			...(articleId ? { articleId: { id: { equals: articleId } } } : null),
			...(chapterId ? { chapterId: { equals: chapterId } } : null),
		},
		take,
		orderBy,
		query: "id text content createdAt chapterId articleId { id title type }",
	})) as (AnnotationItem & {
		articleId: { id: string; title: string; createdAt: string };
	})[];
	return res;
};

const createAnnotationAction = async (data: AnnotationCreateInput) => {
	const session = await auth();
	return await KSwithSession(session).db.Annotation.createOne({
		data: {
			...data,
			createdBy: { connect: { id: session?.user?.id } },
		} as AnnotationCreateInput,
	});
};

const updateAnnotationAction = async (
	id: string,
	data: AnnotationUpdateInput,
) => {
	const session = await auth();
	return await KSwithSession(session).db.Annotation.updateOne({
		where: { id },
		data,
	});
};

const removeAnnotationAction = async (id: string) => {
	const session = await auth();
	return await KSwithSession(session).db.Annotation.deleteOne({
		where: { id },
	});
};

export {
	listAnnotationAction,
	listAnnotationActionWithArticle,
	createAnnotationAction,
	updateAnnotationAction,
	removeAnnotationAction,
};
