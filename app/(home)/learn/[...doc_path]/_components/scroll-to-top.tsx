"use client";

import { ScrollIntoViewKey } from "@/utils/config";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ScrollToTop = () => {
	const pathname = usePathname();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		!location.hash && window.scrollTo(0, 0);
		document.querySelector(`a[${ScrollIntoViewKey}]`)?.scrollIntoView({
			behavior: "instant",
			block: "center",
			inline: "nearest",
		});
	}, [pathname]);

	return null;
};

export { ScrollToTop };
