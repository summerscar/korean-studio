import clsx from "clsx";
import type { TocItem } from "remark-flexible-toc";
import { TOCWrapper } from "./markdown-wrapper";

const Toc = ({ toc }: { toc: TocItem[] }) => {
	const trimTitle = (str: string) => str.replace(/[:：]$/, "");
	return (
		<TOCWrapper toc={toc}>
			{toc.map((item) => (
				<a
					href={item.href}
					style={{ paddingLeft: `${(item.depth - 1) * 8}px` }}
					className={clsx("block py-1", item.depth === 1 && "font-bold")}
					key={item.href}
				>
					{trimTitle(item.value)}
				</a>
			))}
		</TOCWrapper>
	);
};

export { Toc };
