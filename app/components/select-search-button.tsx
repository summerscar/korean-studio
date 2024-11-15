"use client";
import type { CSSProperties } from "react";

interface SearchButtonProps {
	style: CSSProperties;
	onClick: () => void;
}

export const SearchButton = ({ style, onClick }: SearchButtonProps) => {
	return (
		<button
			type="button"
			className="absolute z-[1000] bg-white/80 dark:bg-slate-700 border border-slate-300 shadow-md dark:border-slate-700 rounded p-2 cursor-pointer hover:scale-110 hover:shadow-md transition-all duration-200"
			style={style}
			onClick={onClick}
		>
			<span className="size-4 text-sm">🔍</span>
		</button>
	);
};
