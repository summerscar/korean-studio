import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

function DocsLayout({
	children,
	category,
}: PropsWithChildren<{ category: ReactNode }>) {
	return (
		<div className="flex w-full">
			<nav className="self-start w-64 flex-none sticky top-[--header-height] max-h-[calc(100vh-var(--header-height)-var(--footer-height))] overflow-auto">
				{category}
			</nav>
			<section className="flex-auto p-8 border-l-2 border-slate-900/10">
				{children}
			</section>
		</div>
	);
}

export { DocsLayout };
