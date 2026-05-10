"use client";
import { MDXRemote, type MDXRemoteSerializeResult } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import { Suspense, use, useEffect, useRef, useState } from "react";
import { SelectToSearch } from "@/hooks/use-select-to-search";

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

export const SuggestionPanelStream = ({
	text,
	reasoningText,
	isStreaming,
	error,
}: {
	text: string;
	reasoningText?: string;
	isStreaming: boolean;
	error?: string | null;
}) => {
	const [mdContent, setMdContent] = useState<MDXRemoteSerializeResult>();
	const reasoningRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!text) return;
		(async () => {
			try {
				const mdxSource = await serialize(text);
				setMdContent(mdxSource);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [text]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: reasoningText 变化时需要自动滚到底部
	useEffect(() => {
		if (reasoningRef.current) {
			reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
		}
	}, [reasoningText]);

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-40 text-sm text-error/70 px-4 text-center">
				{error}
			</div>
		);
	}

	if (!text && !reasoningText && isStreaming) {
		return (
			<div className="flex flex-col gap-3 justify-center items-center min-h-40">
				<span className="loading loading-ring loading-lg" />
				<span className="text-sm text-base-content/50 animate-pulse">
					Thinking
					<span
						className="inline-block animate-bounce"
						style={{ animationDelay: "0ms" }}
					>
						.
					</span>
					<span
						className="inline-block animate-bounce"
						style={{ animationDelay: "150ms" }}
					>
						.
					</span>
					<span
						className="inline-block animate-bounce"
						style={{ animationDelay: "300ms" }}
					>
						.
					</span>
				</span>
			</div>
		);
	}

	if (!text && !isStreaming) {
		return (
			<div className="flex justify-center items-center min-h-40 text-sm text-base-content/50">
				No response
			</div>
		);
	}

	return (
		<SelectToSearch
			showAdd
			prompt={"sentence"}
			className="w-full markdown-body h-fit p-2 sm:p-4"
		>
			{isStreaming && reasoningText && !text && (
				<div
					ref={reasoningRef}
					className="w-full max-h-24 overflow-y-auto text-sm text-base-content/40 whitespace-pre-wrap leading-relaxed border-b border-base-content/10 mb-2 pb-2"
				>
					{reasoningText}
				</div>
			)}
			{mdContent && <MDXRemote {...mdContent} />}
			{!mdContent && text && <p className="whitespace-pre-wrap">{text}</p>}
			{isStreaming && (
				<span className="inline-block loading loading-ring loading-sm ml-2" />
			)}
		</SelectToSearch>
	);
};
