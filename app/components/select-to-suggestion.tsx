"use client";
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
				setDisplayText((prev) => prev + res[index++]);
			} else {
				clearInterval(timer);
			}
		}, 50);
		return () => clearInterval(timer);
	}, [res]);

	useEffect(() => {
		(async () => {
			const mdxSource = await serialize(displayText);
			setMdContent(mdxSource);
		})();
	}, [displayText]);

	return (
		<div className="w-full markdown-body">
			{mdContent && <MDXRemote {...mdContent} />}
		</div>
	);
};

export const SuggestionPanel = ({ promise }: { promise: Promise<string> }) => {
	return (
		<Suspense fallback={<span className="loading loading-ring loading-lg" />}>
			<TypeEffectString promise={promise} />
		</Suspense>
	);
};
