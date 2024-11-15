import { SearchButton } from "@/components/select-search-button";
import { debounce } from "lodash";
import { type Root, createRoot } from "react-dom/client";

const selectToSearch = (container: HTMLElement, locale: string) => {
	if (!container) return;

	let root: Root | null = null;
	const buttonContainer = document.createElement("div");
	document.body.appendChild(buttonContainer);

	const isKorean = (text: string) =>
		/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F\u3000-\u303F\uFF00-\uFFEF\s]/.test(
			text,
		);

	const openPapagoSearch = () => {
		const selectedText = window.getSelection()?.toString().trim();
		if (selectedText) {
			const papagoUrl = `https://papago.naver.com/?sk=ko&tk=${locale}&st=${encodeURIComponent(selectedText)}`;
			window.open(
				papagoUrl,
				"PapagoSearch",
				"width=400,height=600,left=150,top=150",
			);
		}
	};

	const showSearchButton = debounce(() => {
		const selection = window.getSelection();
		const selectedText = selection?.toString().trim();

		if (selectedText && isKorean(selectedText)) {
			const range = selection?.getRangeAt(0);
			const rect = range?.getBoundingClientRect();

			if (rect) {
				if (!root) {
					root = createRoot(buttonContainer);
				}

				root.render(
					<SearchButton
						style={{
							display: "flex",
							top: `${rect.bottom + window.scrollY}px`,
							left: `${rect.right + window.scrollX}px`,
						}}
						onClick={openPapagoSearch}
					/>,
				);
			}
		} else if (root) {
			root.render(null);
		}
	}, 300);

	container.addEventListener("mouseup", showSearchButton);

	return () => {
		container.removeEventListener("mouseup", showSearchButton);
		if (root) {
			// Use requestAnimationFrame to ensure unmounting happens after the current render cycle
			requestAnimationFrame(() => {
				root?.unmount();
				root = null;
				buttonContainer.remove();
			});
		}
	};
};

export { selectToSearch };
