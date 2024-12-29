import { listAnnotationAction } from "@/actions/annotate-actions";
import { getDictItemsByUserAction } from "@/actions/user-dict-action";
import { NotableText } from "@/components/notable-text";
import { useUser } from "@/hooks/use-user";
import { timeOutOnce } from "@/utils/time-out";
import { memo, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

const SWR_DICT_KEY = "user-dict-items";
const SWR_ANNOTATION_KEY = "user-annotation-items";
const getAnnotationRevalidateKey = (articleId: string, chapterId?: string) =>
	[SWR_ANNOTATION_KEY, articleId, chapterId].filter(Boolean).join("|");

const useUserDictItems = () => {
	const { isLogin } = useUser();
	const { data = [] } = useSWRImmutable(
		isLogin ? SWR_DICT_KEY : null,
		async () => {
			return await getDictItemsByUserAction();
		},
	);

	return data;
};

const useUserAnnotationItems = (articleId: string, chapterId = "0") => {
	const { isLogin } = useUser();
	const { data = [] } = useSWRImmutable(
		isLogin ? getAnnotationRevalidateKey(articleId, chapterId) : null,
		async () => {
			return await listAnnotationAction(articleId, chapterId);
		},
	);

	return data;
};

export const refreshSWRUserDictItems = async () => {
	await mutate(SWR_DICT_KEY);
};

export const refreshSWRUserAnnotationItems = async (
	articleId: string,
	chapterId?: string,
) => {
	await mutate(getAnnotationRevalidateKey(articleId, chapterId));
};

const useHighlightedDictItems = (
	paragraphIndex: number,
	articleId: string,
	chapterId: string | undefined,
	text: string | React.ReactNode,
	firstLoadWait = 0,
) => {
	const dictItems = useUserDictItems();
	const annotationItems = useUserAnnotationItems(articleId, chapterId);
	const [sleepOnce] = useState(() => timeOutOnce(firstLoadWait));
	const [textWithDictItem, setTextWithDictItem] = useState(text);

	useEffect(() => {
		if (dictItems.length === 0 || typeof text !== "string") return;
		(async () => {
			await sleepOnce();
			requestIdleCallback(() => {
				// 保存过的单词
				const replacedText = dictItems.reduce(
					(acc, cur) => {
						return reactStringReplace(acc, cur.name, (match, index) => (
							<NotableText key={`${cur.id}-${index}`}>{match}</NotableText>
						));
					},
					[text] as React.ReactNode[],
				);
				// TODO: 重合问题
				// 笔记过的单词
				annotationItems.forEach((annotation) => {
					if (
						annotation.range.start.paragraphIndex === paragraphIndex &&
						annotation.range.end.paragraphIndex === paragraphIndex
					) {
						let prevIndex = 0;
						for (const [index, textItem] of Object.entries([...replacedText])) {
							let text = "";
							if (typeof textItem === "string") {
								text = textItem;
							} else if (
								textItem &&
								typeof textItem === "object" &&
								"props" in textItem
							) {
								text = (textItem.props as { children: string }).children;
								prevIndex += text.length;
								continue;
							}
							const offsetStart = annotation.range.start.offset - prevIndex;
							const offsetEnd = annotation.range.end.offset - prevIndex;

							if (offsetStart >= 0 && offsetEnd <= text.length) {
								replacedText.splice(
									+index,
									1,
									...reactStringReplace(
										text,
										text.slice(offsetStart, offsetEnd),
										(match, index, offset) =>
											offset === offsetStart ? (
												<NotableText
													annotation={annotation}
													key={`${annotation.id}-${index}`}
												>
													{match}
												</NotableText>
											) : (
												match
											),
									),
								);
							}
							prevIndex += text.length;
						}
					}
				});

				setTextWithDictItem(replacedText);
			});
		})();
	}, [dictItems, annotationItems, text, paragraphIndex, sleepOnce]);

	return textWithDictItem;
};

const HighLightedDictItems = memo(
	({
		children,
		articleId,
		chapterId,
		paragraphIndex,
	}: {
		children: React.ReactNode;
		paragraphIndex: number;
		articleId: string;
		chapterId?: string;
	}) => {
		const highLightedChildren = useHighlightedDictItems(
			paragraphIndex,
			articleId,
			chapterId,
			children,
			2000,
		);
		return highLightedChildren;
	},
);

export { useUserDictItems, HighLightedDictItems };
