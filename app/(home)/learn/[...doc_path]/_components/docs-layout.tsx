import type { PropsWithChildren, ReactNode } from "react";
import { ScrollToTop } from "./scroll-to-top";

function DocsLayout({
	children,
	category,
}: PropsWithChildren<{ category: ReactNode }>) {
	return (
		<div className="flex w-full flex-col sm:flex-row">
			<ScrollToTop />
			{category}
			<section className="flex flex-auto border-slate-900/10  border-l-2">
				{children}
			</section>
		</div>
	);
}

export { DocsLayout };
