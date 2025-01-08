"use client";
import dynamic from "next/dynamic";
const ProgressBar = dynamic(
	() => import("next-nprogress-bar").then((mod) => mod.AppProgressBar),
	{ ssr: false },
);

const NprogressBar = () => {
	return (
		<ProgressBar
			height="2px"
			options={{ showSpinner: false, parent: "header" }}
			shallowRouting
		/>
	);
};

export { NprogressBar };
