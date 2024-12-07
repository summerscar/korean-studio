import { MDXSpeaker } from "@/components/pronunciation";
import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import type { JSX } from "react";

// TODO: https://www.zenryoku-kun.com/new-post/nextjs-mdx-remote#problem-mdx
// biome-ignore lint/correctness/noUnusedVariables: <explanation>
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
const Alink = ({ children, ...props }: PropsWithChildren<{ href: string }>) => (
	<Link
		className="!text-base-content !underline underline-offset-4"
		target={props.href.startsWith("http") ? "_blank" : "_self"}
		{...props}
		prefetch
	>
		{children}
	</Link>
);
const components = {
	// h1: (props: PropsWithChildren<{ id: string }>) => header(1, props),
	// h2: (props: PropsWithChildren<{ id: string }>) => header(2, props),
	// h3: (props: PropsWithChildren<{ id: string }>) => header(3, props),
	Speak: (props: PropsWithChildren<{ id: string }>) => (
		<MDXSpeaker {...props} />
	),
	a: (props: PropsWithChildren<{ href: string }>) => Alink(props),
} as Readonly<MDXComponents>;

export { components };
