"use client";
import CopyIcon from "@/assets/svg/copy.svg";
import SearchIcon from "@/assets/svg/search.svg";
import type { CSSProperties, ComponentProps } from "react";

interface SearchButtonProps {
	style?: CSSProperties;
	onClick: () => void;
	icon: "search" | "copy" | "sparkles";
	title: string;
}

function Sparkles({ ...props }: ComponentProps<"span">) {
	return <span {...props}>✨</span>;
}
const IconMap = {
	search: SearchIcon,
	copy: CopyIcon,
	sparkles: Sparkles,
};

export const SearchButton = ({
	style,
	onClick,
	icon = "search",
	title,
}: SearchButtonProps) => {
	const Icon = IconMap[icon];

	return (
		<button
			type="button"
			className=" flex hover:bg-slate-200/60 dark:hover:bg-slate-200/20 border-r border-base-content/10 last:border-r-0 p-2 rounded-none cursor-pointer transition-all duration-200"
			style={style}
			onClick={onClick}
			title={title}
		>
			<Icon className="size-4 text-sm" />
		</button>
	);
};
