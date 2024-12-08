import { FloatButtonsPanel } from "@/components/float-buttons-panel";
import { useClickAway, useEventListener, useMemoizedFn } from "ahooks";
import {
	type ComponentProps,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from "react";

const useHoverToSearch = (
	text?: string,
	prompt?: ComponentProps<typeof FloatButtonsPanel>["prompt"],
) => {
	const [showPanel, setShowPanel] = useState(false);
	const targetRef = useRef<HTMLElement>(null);
	const isTouchRef = useRef(false);
	const buttonContainer = useRef<HTMLDivElement>(null);
	// biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
	const cancelAutoCloseRef = useRef<() => void | undefined>(undefined);

	const closePanel = () => {
		setShowPanel(false);
	};

	const onMouseOver = useMemoizedFn(() => {
		if (!targetRef.current || !text) {
			return;
		}
		setShowPanel(true);
	});

	useEffect(() => {
		if (showPanel) {
			const cancelAutoClose = (cancelAutoCloseRef.current = autoClose());
			return () => {
				cancelAutoClose?.();
			};
		}
	}, [showPanel]);

	const autoClose = useMemoizedFn(() => {
		if (buttonContainer.current) {
			let timer: ReturnType<typeof setTimeout>;
			const cleanTimer = () => {
				clearTimeout(timer);
			};

			const cancelAutoClose = () => {
				cleanTimer();
				buttonContainer.current?.removeEventListener("mouseenter", cleanTimer);
				buttonContainer.current?.removeEventListener("mouseleave", callback);
			};
			const callback = () => {
				cleanTimer();
				timer = setTimeout(() => {
					closePanel();
				}, 2000);
			};

			callback();
			buttonContainer.current.addEventListener("mouseenter", cleanTimer);
			buttonContainer.current.addEventListener("mouseleave", callback);
			return cancelAutoClose;
		}
	});

	useEventListener("mouseover", onMouseOver, {
		target: targetRef,
	});

	useEventListener(
		"touchstart",
		() => {
			isTouchRef.current = true;
			onMouseOver();
		},
		{
			target: targetRef,
		},
	);

	useEventListener(
		"touchend",
		() => {
			setTimeout(() => {
				isTouchRef.current = false;
			}, 16);
		},
		{
			target: targetRef,
		},
	);

	useClickAway((e) => {
		if (isTouchRef.current && targetRef.current?.contains(e.target as Node)) {
			return;
		}

		let parent: Element | null = e.target as Element;
		while ((parent = parent.parentElement)) {
			if (parent.getAttribute("data-ignore-click-away") === "true") {
				return;
			}
		}

		closePanel();
	}, buttonContainer);

	const panel = showPanel && (
		<FloatButtonsPanel
			ref={buttonContainer as RefObject<HTMLDivElement | null>}
			position="top"
			getRect={() => targetRef.current!.getBoundingClientRect()}
			selectedText={text!}
			prompt={prompt}
			onClose={() => {
				closePanel();
			}}
			onAIPanel={() => {
				cancelAutoCloseRef.current?.();
			}}
		/>
	);

	return [targetRef, panel] as const;
};

export { useHoverToSearch };
