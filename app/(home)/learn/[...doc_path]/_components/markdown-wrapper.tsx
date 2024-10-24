import type { ReactNode } from "react";

const MDContentWrapper = ({ children }: { children: ReactNode }) => (
	<article className="markdown-body p-8 border-r-2 border-slate-900/10 flex-auto">
		{children}
	</article>
);

const TOCWrapper = ({ children }: { children: ReactNode }) => (
	<div className="w-48 flex-none text-xs p-3 sticky self-start overflow-auto top-[--header-height] max-h-[calc(100vh-var(--header-height))]">
		{children}
	</div>
);

export { MDContentWrapper, TOCWrapper };
