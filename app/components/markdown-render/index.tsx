import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { PropsWithChildren } from "react";

const header = (level: 1 | 2 | 3, props: PropsWithChildren<{ id: string }>) => {
	const size = {
		1: "text-2xl",
		2: "text-xl",
		3: "text-lg",
	}[level];
	const Header = `h${level}` as keyof JSX.IntrinsicElements;
	return (
		<Header {...props} className={`font-bold ${size}`}>
			<Link
				href={`#${props.id}`}
				className="hover:underline !text-base-content"
			>
				{props.children}
			</Link>
		</Header>
	);
};

const components = {
	h1: (props: PropsWithChildren<{ id: string }>) => header(1, props),
	h2: (props: PropsWithChildren<{ id: string }>) => header(2, props),
	h3: (props: PropsWithChildren<{ id: string }>) => header(3, props),
} as Readonly<MDXComponents>;

export { components };
