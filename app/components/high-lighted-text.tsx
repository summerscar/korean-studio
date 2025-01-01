import { listAnnotationAction } from "@/actions/annotate-actions";
import { getDictItemsByUserAction } from "@/actions/user-dict-action";
import { NotableText } from "@/components/notable-text";
import { useUser } from "@/hooks/use-user";
import { emptyArray } from "@/utils/const";
import { timeOutOnce } from "@/utils/time-out";
import { memo, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";
import { mutate } from "swr";
import useSWRImmutable from "swr/immutable";

const SWR_DICT_KEY = "user-dict-items";
const SWR_ANNOTATION_KEY = "user-annotation-items";
const getAnnotationRevalidateKey = ({
	articleId,
	chapterId,
}: { articleId?: string; chapterId?: string }) =>
	[SWR_ANNOTATION_KEY, articleId, chapterId].filter(Boolean).join("|");

let increment = 0;

const useUserDictItems = () => {
	const { isLogin } = useUser();
	const { data = emptyArray } = useSWRImmutable(
		isLogin ? SWR_DICT_KEY : null,
		async () => {
			const res = await getDictItemsByUserAction();
			return res;
		},
	);

	return data;
};

const useUserAnnotationItems = (articleId: string, chapterId = "0") => {
	const { isLogin } = useUser();
	const { data = emptyArray } = useSWRImmutable(
		isLogin ? getAnnotationRevalidateKey({ articleId, chapterId }) : null,
		async () => {
			return await listAnnotationAction({ articleId, chapterId });
		},
	);

	return data;
};

export const refreshSWRUserDictItems = async () => {
	await mutate(SWR_DICT_KEY);
};

export const refreshSWRUserAnnotationItems = async ({
	articleId,
	chapterId,
}: { articleId?: string; chapterId?: string }) => {
	await mutate(getAnnotationRevalidateKey({ articleId, chapterId }));
};

const useHighlightedText = (
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
						return reactStringReplace(acc, cur.name, (match) => (
							<NotableText key={`${increment++}`}>{match}</NotableText>
						));
					},
					[text] as React.ReactNode[],
				);

				// 笔记过的单词
				annotationItems.forEach((annotation) => {
					if (
						annotation.range.start.paragraphIndex === paragraphIndex &&
						annotation.range.end.paragraphIndex === paragraphIndex
					) {
						let prevIndex = 0;
						for (const [index, textItem] of Object.entries([...replacedText])) {
							let _text = "";
							if (typeof textItem === "string") {
								_text = textItem;
							} else if (
								textItem &&
								typeof textItem === "object" &&
								"props" in textItem
							) {
								_text = (textItem.props as { children: string }).children;
								prevIndex += _text.length;
								continue;
							}
							const offsetStart = annotation.range.start.offset - prevIndex;
							const offsetEnd = annotation.range.end.offset - prevIndex;

							if (offsetStart >= 0 && offsetEnd <= _text.length) {
								replacedText.splice(
									+index,
									1,
									...reactStringReplace(
										_text,
										_text.slice(offsetStart, offsetEnd),
										(match, _index, offset) =>
											offset === offsetStart ? (
												<NotableText
													annotation={annotation}
													key={`${increment++}`}
												>
													{match}
												</NotableText>
											) : (
												match
											),
									),
								);
							}
							prevIndex += _text.length;
						}
					}
				});

				setTextWithDictItem(replacedText);
			});
		})();
	}, [dictItems, annotationItems, text, paragraphIndex, sleepOnce]);

	return textWithDictItem;
};

const HighLightedText = memo(
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
		const highLightedChildren = useHighlightedText(
			paragraphIndex,
			articleId,
			chapterId,
			children,
			2000,
		);
		return highLightedChildren;
	},
);

export { useUserDictItems, HighLightedText };
