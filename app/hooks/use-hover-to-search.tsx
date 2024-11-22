import { FloatButtonsPanel } from "@/components/float-buttons-panel";
import {
	useClickAway,
	useEventListener,
	useMemoizedFn,
	useUnmount,
} from "ahooks";
import { useLocale } from "next-intl";
import { useRef } from "react";
import { type Root, createRoot } from "react-dom/client";

const useHoverToSearch = (text?: string) => {
	const locale = useLocale();
	const targetRef = useRef<HTMLElement>(null);
	const rootRef = useRef<Root>(null);
	const buttonContainer = useRef<HTMLDivElement>(null);

	const onMouseOver = useMemoizedFn(() => {
		if (
			!targetRef.current ||
			!text ||
			buttonContainer.current?.childNodes.length
		) {
			return;
		}

		if (!buttonContainer.current) {
			buttonContainer.current = document.createElement("div");
		}
		document.body.appendChild(buttonContainer.current);
		const root =
			rootRef.current ||
			(rootRef.current = createRoot(buttonContainer.current));
		const cancel = autoClose();
		root.render(
			<FloatButtonsPanel
				position="top"
				locale={locale}
				rect={targetRef.current.getBoundingClientRect()}
				selectedText={text}
				root={root}
				onClose={() => {
					cancel?.();
					cleanRoot();
				}}
			/>,
		);
	});

	const cleanRoot = useMemoizedFn(() => {
		rootRef.current?.render(null);
	});

	const cleanup = useMemoizedFn(() => {
		requestAnimationFrame(() => {
			rootRef.current?.render(null);
			rootRef.current?.unmount();
			rootRef.current = null;
			buttonContainer.current?.remove();
		});
	});

	const autoClose = useMemoizedFn(() => {
		if (buttonContainer.current) {
			let timer: ReturnType<typeof setTimeout>;
			const cleanup = () => {
				clearTimeout(timer);
			};

			const cancel = () => {
				cleanup();
				buttonContainer.current?.removeEventListener("mouseenter", cleanup);
				buttonContainer.current?.removeEventListener("mouseleave", callback);
			};
			const callback = () => {
				clearTimeout(timer);
				timer = setTimeout(() => {
					cleanRoot();
					cancel();
				}, 2000);
			};

			callback();
			buttonContainer.current.addEventListener("mouseenter", cleanup);
			buttonContainer.current.addEventListener("mouseleave", callback);
			return cancel;
		}
	});

	useUnmount(() => {
		cleanup();
	});

	useEventListener("mouseover", onMouseOver, {
		target: targetRef,
	});

	useClickAway(() => {
		cleanup();
	}, buttonContainer);

	return targetRef;
};

export { useHoverToSearch };
