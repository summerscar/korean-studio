"use client";
import CopyIcon from "@/assets/svg/copy.svg";
import SearchIcon from "@/assets/svg/search.svg";
import SparklesIcon from "@/assets/svg/sparkles.svg";
import type { CSSProperties, ComponentProps } from "react";

interface SearchButtonProps {
	style?: CSSProperties;
	onClick: () => void;
	icon: "search" | "copy" | "sparkles";
}

const IconMap = {
	search: SearchIcon,
	copy: CopyIcon,
	sparkles: SparklesIcon,
};

export const SearchButton = ({
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
