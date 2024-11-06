"use client";
import clsx from "clsx";
import { usePathname } from "next/navigation";

const HomeProgressCSSVar = "--home-progress";

const Progress = () => {
	const pathname = usePathname();

	const isLearnPage = pathname.startsWith("/learn");
	const isHome = pathname === "/";
	const showProgress = isLearnPage || isHome;

	return (
		showProgress && (
			<div
				id="progress"
				style={{
					...(isLearnPage && { animationTimeline: "--page-scroll" }),
					...(isHome && {
						transform: `scaleX(var(${HomeProgressCSSVar}, 0))`,
						transition: "transform 0.5s",
					}),
				}}
				className={clsx(
					"absolute left-0 bottom-0 w-full h-[2px] bg-base-content origin-[0%_50%]",
					isLearnPage && "animate-[grow-progress_auto_linear]",
				)}
			/>
		)
	);
};

const setProgressCSSVar = (percent: number) => {
	document.documentElement.style.setProperty(HomeProgressCSSVar, `${percent}`);

	return () => {
		document.documentElement.style.removeProperty(HomeProgressCSSVar);
	};
};

export { Progress, setProgressCSSVar };
