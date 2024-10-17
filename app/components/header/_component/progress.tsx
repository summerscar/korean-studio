"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Progress = () => {
	const pathname = usePathname();
	const [showProgress, setShowProgress] = useState(false);

	useEffect(() => {
		const footerHeight = document
			.getElementsByTagName("footer")[0]
			.getBoundingClientRect().height;
		document.documentElement.style.setProperty(
			"--footer-height",
			`${footerHeight}px`,
		);

		const canScroll =
			document.body.scrollHeight >
			(window.innerHeight || document.documentElement.clientHeight);

		setShowProgress(canScroll && pathname.includes("/learn"));
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
