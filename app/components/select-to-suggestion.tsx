"use client";
import { SelectToSearch } from "@/hooks/use-select-to-search";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { Suspense, use, useEffect, useState } from "react";

const TypeEffectString = ({ promise }: { promise: Promise<string> }) => {
	const res = use(promise);
	const [displayText, setDisplayText] = useState("");
	const [mdContent, setMdContent] = useState<MDXRemoteSerializeResult>();

	useEffect(() => {
		let index = 0;
		setDisplayText("");
		const timer = setInterval(() => {
			if (index < res.length) {
				const currentIndex = index;
				setDisplayText((prev) => {
					if (prev.length === currentIndex) {
						index = currentIndex + 1;
						return prev + res[currentIndex];
					}
					return prev;
				});
			} else {
				clearInterval(timer);
			}
		}, 20);
		return () => clearInterval(timer);
	}, [res]);

	useEffect(() => {
		(async () => {
			try {
				const mdxSource = await serialize(displayText);
				setMdContent(mdxSource);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [displayText]);

	return (
		<SelectToSearch
			showAdd
			prompt={"sentence"}
			className="w-full markdown-body h-fit p-2 sm:p-4"
		>
			{mdContent && <MDXRemote {...mdContent} />}
		</SelectToSearch>
	);
};

export const SuggestionPanel = ({ promise }: { promise: Promise<string> }) => {
	return (
		<Suspense fallback={<span className="loading loading-ring loading-lg" />}>
			<TypeEffectString promise={promise} />
		</Suspense>
	);
};
