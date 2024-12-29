import type { AnnotationUpdateInput, Lists } from ".keystone/types";

export type AnnotationItem = Omit<Lists.Annotation.Item, "range"> & {
	range: {
		start: { paragraphIndex: number; offset: number };
		end: { paragraphIndex: number; offset: number };
	};
};

export type AnnotationUpdateItem = AnnotationUpdateInput;
