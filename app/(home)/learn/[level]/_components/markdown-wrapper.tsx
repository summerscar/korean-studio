"use client";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import type { TocItem } from "remark-flexible-toc";

const MDContentWrapper = ({
	children,
	lastModified,
	bottomNav,
}: { children: ReactNode; lastModified?: string; bottomNav?: ReactNode }) => {
	return (
		<article
			data-last-modified={lastModified}
			className="p-8 border-r-2 border-slate-900/10 flex-auto"
		>
			<SelectToSearch showAI={false} className="markdown-body">
				{children}
			</SelectToSearch>
			{bottomNav}
		</article>
	);
};

const TOCWrapper = ({
	children,
	toc = [],
}: { children: ReactNode; toc?: TocItem[] }) => {
	const [activeToc, setActiveToc] = useState("");

	/** 给 progress bar 用，刚好有个 RSC 组件，物尽其用 */
	const pathname = usePathname();
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const canScroll =
			document.body.scrollHeight >
			(window.innerHeight || document.documentElement.clientHeight);
		document.body.setAttribute("data-can-scroll", String(canScroll));
	}, [pathname]);
	/** end */

	useEffect(() => {
		if (toc.length === 0) {
			return;
		}
		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const id = entry.target.getAttribute("id");
					if (id) {
						setActiveToc(`#${id}`);
					}
				}
			});
		});
		toc.forEach(({ href }) => {
			const id = href.split("#")[1];
			const el = document.getElementById(id);
			if (el) {
				observer.observe(el);
			}
		});

		return () => {
			toc.forEach(({ href }) => {
				const id = href.split("#")[1];
				const el = document.getElementById(id);
				if (el) {
					observer.unobserve(el);
				}
				observer.disconnect();
			});
		};
	}, [toc]);

	return (
		<div className="hidden md:block w-48 flex-none text-xs p-3 sticky self-start overflow-auto top-[--header-height] max-h-[calc(100dvh-var(--header-height))]">
			{activeToc && (
				<style>
					{`
					a[href="${activeToc}"] {
						font-weight: bold;
					}`}
				</style>
			)}
			{children}
		</div>
	);
};

export { MDContentWrapper, TOCWrapper };
