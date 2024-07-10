import Link from "next/link";
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className="flex w-full">
			<div className="w-1/4 flex-none border-r-2 border-slate-900/10 p-4">
				<ul>
					<li>
						<Link href="/beginner">Intro</Link>
					</li>
				</ul>
			</div>
			<div className="markdown-body flex-auto p-8">{children}</div>
		</div>
	);
}
