import type { PropsWithChildren, ReactNode } from "react";
import { ScrollToTop } from "./scroll-to-top";

function DocsLayout({
	children,
	category,
}: PropsWithChildren<{ category: ReactNode }>) {
	return (
		<div className="flex w-full">
			<ScrollToTop />
			<nav className="self-start w-64 flex-none sticky top-[--header-height] max-h-[calc(100vh-var(--header-height))] overflow-auto">
				{category}
			</nav>
			<section className="flex-auto p-8 border-l-2 border-slate-900/10">
				{children}
			</section>
		</div>
	);
}

export { DocsLayout };
