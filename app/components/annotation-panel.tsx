import {
	createAnnotationAction,
	removeAnnotationAction,
	updateAnnotationAction,
} from "@/actions/annotate-actions";
import { refreshSWRUserAnnotationItems } from "@/components/high-lighted-dict-items";
import { usePanelReposition } from "@/hooks/use-panel-reposition";
import { createLoadingToast } from "@/hooks/use-toast";
import type { AnnotationItem, AnnotationUpdateItem } from "@/types/annotation";
import { isDev } from "@/utils/is-dev";
import { useUnmount } from "ahooks";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

const AnnotationPanel = ({
	showAbove,
	rect,
	ref,
	annotation,
}: {
	showAbove: boolean;
	rect: DOMRect;
	ref?: React.RefObject<HTMLDivElement | null>;
	annotation?: AnnotationItem;
}) => {
	const observerRef = usePanelReposition({ showAbove, rect });
	return (
		<div
			style={{
				top: `${showAbove ? rect.top - 160 + window.scrollY : rect.bottom + window.scrollY}px`,
				left: `${rect.right - rect.width / 2 + window.scrollX}px`,
			}}
			className="z-[5] absolute flex justify-center pointer-events-none"
			ref={(el) => {
				if (el) {
					ref && (ref.current = el);
					observerRef.current = el;
					return () => {
						observerRef.current = null;
						ref && (ref.current = null);
					};
				}
			}}
		>
			<div
				className={`flex backdrop-blur-xl rounded-lg w-[60vw] sm:w-80 h-40 justify-center items-stretch text-wrap text-base-content/80 border border-base-content/10 bg-white/10 shadow pointer-events-auto overflow-auto ${showAbove ? "mb-2" : "mt-2"}`}
			>
				<Annotation annotation={annotation} />
			</div>
		</div>
	);
};

const Annotation = ({ annotation }: { annotation?: AnnotationItem }) => {
	const [value, setValue] = useState(annotation?.content || "");
	const [range] = useState(() => window.getSelection()?.getRangeAt(0));
	// TODO: 作为组件参数
	const [bookId] = useState(() => location.pathname.split("/").pop());
	const chapterId = useSearchParams().get("ep") || "0";

	const unmountPromise = useRef<Promise<void> | null>(null);

	const create = async () => {
		if (!range) return;
		// TODO: 处理重合的问题
		const rangeText = range.toString();
		const getParentParagraph = (node: Node) => {
			return (node.parentElement as HTMLElement).closest(
				"p[data-paragraph-index]",
			) as HTMLParagraphElement | null;
		};

		const startPIndex = getParentParagraph(range.startContainer)?.dataset
			.paragraphIndex;

		const endPIndex = getParentParagraph(range.endContainer)?.dataset
			.paragraphIndex;

		const startContainer = range.startContainer;
		const endContainer = range.endContainer;

		const getOffsetInParent = (container: Node, offset: number): number => {
			const parentParagraph = getParentParagraph(container);
			if (!parentParagraph) return offset;

			let totalOffset = 0;
			let currentNode: Node | null = parentParagraph.firstChild;

			while (currentNode) {
				if (currentNode === container) {
					totalOffset += offset;
					break;
				}

				if (currentNode.nodeType === Node.TEXT_NODE) {
					totalOffset += (currentNode as Text).length;
				} else if (currentNode.nodeType === Node.ELEMENT_NODE) {
					const textContent = (currentNode as Element).textContent || "";
					totalOffset += textContent.length;
				}

				currentNode = currentNode.nextSibling;
			}

			return totalOffset;
		};

		const startOffset = getOffsetInParent(startContainer, range.startOffset);
		const endOffset = getOffsetInParent(endContainer, range.endOffset);

		const newAnnotation = {
			type: "NOTE",
			bookId: { connect: { id: bookId } },
			chapterId,
			content: value,
			text: rangeText,
			range: {
				start: {
					paragraphIndex: Number(startPIndex),
					offset: startOffset,
				},
				end: {
					paragraphIndex: Number(endPIndex),
					offset: endOffset,
				},
			},
		} as AnnotationUpdateItem;

		if (!unmountPromise.current) {
			const cancel = createLoadingToast("Creating……");
			unmountPromise.current = createAnnotationAction(newAnnotation)
				.then(() => {})
				.finally(async () => {
					unmountPromise.current = null;
					await refreshSWRUserAnnotationItems(bookId!, chapterId);
					isDev && console.log("[create annotation][success]", newAnnotation);
					cancel();
				});
		}
	};

	const remove = async (annotation: AnnotationItem) => {
		const cancel = createLoadingToast("Removing…");
		await removeAnnotationAction(annotation.id);
		await refreshSWRUserAnnotationItems(bookId!, chapterId);
		cancel();
		isDev && console.log("[remove annotation][success]", annotation);
	};

	const update = async (annotation: AnnotationItem) => {
		if (value === annotation.content) return;
		const cancel = createLoadingToast("Updating…");
		await updateAnnotationAction(annotation.id, { content: value });
		await refreshSWRUserAnnotationItems(bookId!, chapterId);
		cancel();
		isDev && console.log("[update annotation][success]");
	};

	useUnmount(async () => {
		if (annotation) {
			if (!value) {
				await remove(annotation);
				return;
			}
			await update(annotation);
		} else {
			if (!value) return;
			await create();
		}
	});

	return (
		<textarea
			value={value}
			onChange={(e) => {
				setValue(e.target.value);
			}}
			className="w-full h-full resize-none bg-transparent focus:outline-none p-2"
			// biome-ignore lint/a11y/noAutofocus: <explanation>
			autoFocus={!annotation?.content}
		/>
	);
};

export { AnnotationPanel };
