import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className="flex w-full">
			<div className="self-start w-1/4 flex-none p-8 sticky top-14 max-h-[calc(100vh-var(--header-height))] overflow-auto">
				<ul>
					<li className="my-2">
						<Link href="/beginner">Intro</Link>
					</li>
				</ul>
			</div>
			<div className="markdown-body flex-auto p-8 border-l-2 border-slate-900/10">
				{children}
			</div>
		</div>
	);
}
