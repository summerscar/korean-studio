"use server";
import { KSwithSession } from "@/../keystone/context";
import type { AnnotationItem } from "@/types/annotation";
import { auth } from "auth";
import type {
	AnnotationCreateInput,
	AnnotationUpdateInput,
} from ".keystone/types";

const listAnnotationAction = async ({
	articleId,
	chapterId,
}: { articleId?: string; chapterId?: string }) => {
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
	})) as AnnotationItem[];

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
	createAnnotationAction,
	updateAnnotationAction,
	removeAnnotationAction,
};
