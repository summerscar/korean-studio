import type { UserDicts } from "@/types/dict";
import { useEffect } from "react";

const ATTR = "data-dict-theme";
const CSS_VAR = "--dict-bg";

const useDictTheme = (dict?: UserDicts[0]) => {
	useEffect(() => {
		if (!dict?.poster) return;
		document.documentElement.setAttribute(ATTR, "true");
		document.documentElement.style.setProperty(
			CSS_VAR,
			`url('${dict.poster}')`,
		);
		return () => {
			document.documentElement.removeAttribute(ATTR);
			document.documentElement.style.removeProperty(CSS_VAR);
		};
	}, [dict?.poster]);
};
export { useDictTheme };
