import { FloatButtonsPanel } from "@/components/float-buttons-panel";
import type { SITES_LANGUAGE } from "@/types/site";
import { useDebounceFn, useEventListener, useUnmount } from "ahooks";
import { SessionProvider, useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { type ComponentProps, useEffect, useRef } from "react";
import { type Root, createRoot } from "react-dom/client";

const useSelectToSearch = ({
	showCopy = true,
	showSearch = true,
	showAI = true,
	showAdd = false,
	prompt,
}: Config = {}) => {
	const containerRef = useRef<HTMLElement>(null);
	const locale = useLocale();
	const { data: session } = useSession();
	const translate = useTranslations();
	const buttonContainerRef = useRef<HTMLDivElement>(null);
	const rootRef = useRef<Root | null>(null);

	const isKorean = (text: string) =>
		/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3000-\u303F\uFF00-\uFFEF\s]/.test(
			text,
		);

	useEffect(() => {
		const buttonContainer = (buttonContainerRef.current =
			document.createElement("div"));
		document.body.appendChild(buttonContainer);
	}, []);

	const { run: showSearchButton } = useDebounceFn(
		() => {
			let root = rootRef.current;
			const selection = window.getSelection();
			const selectedText = selection?.toString().trim();

			if (selectedText && isKorean(selectedText)) {
				const range = selection?.getRangeAt(0);
				const rect = range?.getBoundingClientRect();

				if (rect && buttonContainerRef.current) {
					if (!root) {
						root = rootRef.current = createRoot(buttonContainerRef.current);
					}
					const panel = (
						<FloatButtonsPanel
							getRect={() => range!.getBoundingClientRect()}
							selectedText={selectedText}
							showSearch={showSearch}
							showCopy={showCopy}
							showAI={showAI}
							showAdd={showAdd}
							locale={locale as SITES_LANGUAGE}
							root={root}
							prompt={prompt}
							onClose={() => {
								root?.render(null);
							}}
							translate={
								translate as ComponentProps<
									typeof FloatButtonsPanel
								>["translate"]
							}
						/>
					);

					root.render(
						showAdd ? (
							<SessionProvider session={session}>{panel}</SessionProvider>
						) : (
							panel
						),
					);
				}
			} else if (root) {
				root.render(null);
			}
		},
		{ wait: 150 },
	);

	useEventListener("mouseup", showSearchButton, {
		target: containerRef,
	});

	useUnmount(() => {
		const root = rootRef.current;
		if (root) {
			requestAnimationFrame(() => {
				root?.unmount();
				rootRef.current = null;
				buttonContainerRef.current?.remove();
			});
		}
	});

	return containerRef;
};

type Config = {
	showCopy?: boolean;
	showSearch?: boolean;
	showAI?: boolean;
	showAdd?: boolean;
	prompt?: ComponentProps<typeof FloatButtonsPanel>["prompt"];
};

export { useSelectToSearch };
