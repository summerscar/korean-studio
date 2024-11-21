"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { headerConfig } from "..";

const ActiveLinks = ({ links }: { links: ReturnType<typeof headerConfig> }) => {
	const pathname = usePathname();
	const isActive = (href: string) => pathname.includes(href);

	return (
		<>
			{links.map(({ href, label }) => (
				<Link
					prefetch
					key={href}
					href={href}
					className={clsx(isActive(href) && "bg-slate-400/40")}
				>
					<span>{label}</span>
				</Link>
			))}
		</>
	);
};

export { ActiveLinks };
