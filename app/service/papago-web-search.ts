import type { SITES_LANGUAGE } from "@/types/site";

const papagoWebSearch = (text: string, locale = "zh-CN" as SITES_LANGUAGE) => {
	const papagoUrl = `https://papago.naver.com/?sk=ko&tk=${locale}&st=${encodeURIComponent(text)}`;
	window.open(
		papagoUrl,
		"PapagoSearch",
		"width=400,height=600,left=150,top=150",
	);
};

export { papagoWebSearch };
