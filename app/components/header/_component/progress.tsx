"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Progress = () => {
	const pathname = usePathname();
	const [showProgress, setShowProgress] = useState(false);

	useEffect(() => {
		setShowProgress(pathname.includes("/learn"));

		return () => {
			setShowProgress(false);
		};
	}, [pathname]);

	return (
		showProgress && (
			<div
				id="progress"
				style={{ animationTimeline: "--page-scroll" }}
				className="absolute left-0 bottom-0 w-full h-[2px] bg-base-content origin-[0%_50%] animate-[grow-progress_auto_linear]"
			/>
		)
	);
};

export { Progress };
