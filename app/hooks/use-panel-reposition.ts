import { useMemoizedFn } from "ahooks";
import { useEffect, useRef } from "react";

const usePanelReposition = ({
	showAbove,
	rect,
}: {
	showAbove: boolean;
	rect: DOMRect;
}) => {
	const observerRef = useRef<HTMLDivElement>(null);

	const onResize = useMemoizedFn((entries: ResizeObserverEntry[]) => {
		const el = entries[0].target as HTMLDivElement;
		const { height, bottom, right, width } = el.getBoundingClientRect();
		if (showAbove) {
			el.style.top = `${rect.top - height + window.scrollY}px`;
		} else {
			// 从下面(超出文档高度)修正到上面
			/* 	if (bottom + window.scrollY > document.body.clientHeight) {
				el.style.top = `${rect.top - height + window.scrollY}px`;
				return;
			} */
			if (bottom > window.innerHeight) {
				el.style.top = `${rect.top - height + window.scrollY}px`;
			}
		}

		// 防止右侧超出屏幕
		if (right + window.scrollX > document.body.clientWidth) {
			el.style.left = `${document.body.clientWidth - width - 50 + window.scrollX}px`;
		}
	});

	useEffect(() => {
		const observer = new ResizeObserver(onResize);
		observerRef.current && observer.observe(observerRef.current);

		return () => {
			observerRef.current && observer.unobserve(observerRef.current);
			observer.disconnect();
		};
	}, [onResize]);

	return observerRef;
};

export { usePanelReposition };
