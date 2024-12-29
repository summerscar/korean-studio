import CopyIcon from "@/assets/svg/copy.svg";
import AddIcon from "@/assets/svg/folder-plus.svg";
import PenIcon from "@/assets/svg/pen.svg";
import SearchIcon from "@/assets/svg/search.svg";
import SparklesIcon from "@/assets/svg/sparkles.svg";
import TranslateIcon from "@/assets/svg/translate.svg";
import type { CSSProperties } from "react";

interface SearchButtonProps {
	style?: CSSProperties;
	onClick: () => void;
	icon: "search" | "copy" | "sparkles" | "add" | "translate" | "annotate";
}

const IconMap = {
	search: SearchIcon,
	translate: TranslateIcon,
	copy: CopyIcon,
	sparkles: SparklesIcon,
	add: AddIcon,
	annotate: PenIcon,
};

export const FloatButton = ({
	style,
	onClick,
	icon = "search",
}: SearchButtonProps) => {
	const Icon = IconMap[icon];

	return (
		<button
			type="button"
			className=" flex hover:bg-slate-200/60 dark:hover:bg-slate-200/20 border-r border-base-content/10 last:border-r-0 p-2 rounded-none cursor-pointer transition-all duration-200"
			style={style}
			onClick={onClick}
		>
			<Icon className="size-4 text-sm" />
		</button>
	);
};
