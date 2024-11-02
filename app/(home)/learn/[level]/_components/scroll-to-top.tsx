"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ScrollToTop = () => {
	const pathname = usePathname();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		!location.hash && window.scrollTo(0, 0);
	}, [pathname]);

	return null;
};

export { ScrollToTop };
