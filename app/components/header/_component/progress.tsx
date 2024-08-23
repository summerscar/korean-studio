"use client";

import { usePathname } from "next/navigation";

const Progress = () => {
	const pathname = usePathname();
	if (!pathname.includes("/learn")) return null;
	return (
		<div
			id="progress"
			style={{ animationTimeline: "--page-scroll" }}
			className="absolute left-0 bottom-0 w-full h-[2px] bg-accent origin-[0%_50%] animate-[grow-progress_auto_linear]"
		/>
	);
};

export { Progress };
