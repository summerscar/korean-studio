"use client";
import type { Levels } from "@/types";
import { toPlainObject } from "@/utils/to-plain-object";
import clsx from "clsx";
import FlexSearch from "flexsearch";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { type ReactNode, useEffect, useState } from "react";
import reactStringReplace from "react-string-replace";

type SearchResult = {
	type: "title" | "content";
	contentSnippet: string | null | ReactNode;
	titleSnippet: string | null | ReactNode;
	url: string;
	level: Levels;
	relativeReadablePath: string;
	doc: {
		title: string;
		content: string;
		url: string;
	};
	id: number;
};

const Search = () => {
	const tHeader = useTranslations("Header");
	const [isInputFocused, setIsInputFocused] = useState(false);
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [searchIndex, setSearchIndex] =
		useState<InstanceType<typeof FlexSearch.Document>>();

	useEffect(() => {
		const loadIndex = async () => {
			const response = await fetch("/search-index.json", {
				next: { revalidate: 24 * 60 * 60 },
			});
			const searchData: {
				id: string;
				content: string;
				title: string;
				url: string;
			}[] = await response.json();

			const index = new FlexSearch.Document({
				// encode: (str) => str.replace(/[\x00-\x7F]/g, "").split(""),
				document: {
					id: "id",
					index: ["title", "content"],
					store: ["title", "content", "url", "level", "relativeReadablePath"],
				},
			});

			searchData.forEach((item, _index) => {
				index.add({
					...item,
					id: _index,
				});
			});

			setSearchIndex(index);
		};

		loadIndex();
	}, []);

	const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchQuery = e.target.value;
		setQuery(searchQuery);

		if (searchQuery.length > 0 && searchIndex) {
			const matches = await searchIndex.search(searchQuery, {
				enrich: true,
				limit: 12,
			});
			setResults(
				toPlainObject(matches).flatMap(
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
					(item: { result: any[]; field: any }) => {
						// biome-ignore lint/suspicious/noExplicitAny: <explanation>
						item.result.forEach((res: any) => {
							res.type = item.field;
							res.contentSnippet = extractSnippet(res.doc.content, searchQuery);
							res.titleSnippet = extractSnippet(res.doc.title, searchQuery);
							res.url = res.doc.url;
							res.level = res.doc.level;
							res.relativeReadablePath = res.doc.relativeReadablePath;
						});
						return item.result;
					},
				) as SearchResult[],
			);
		} else {
			setResults([]);
		}
	};

	return (
		<div className="relative mr-0 sm:mr-4">
			<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
				<svg
					aria-hidden="true"
					className="w-5 h-5 text-gray-500 dark:text-gray-400"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/>
				</svg>
			</div>
			{/* 输入会滚动页面：https://stackoverflow.com/questions/65929206/sticky-header-input-scrolls-on-input */}
			<input
				value={query}
				onInput={handleSearch}
				type="search"
				className="input input-sm max-w-52 pl-10 bg-white/30 peer"
				placeholder={tHeader("search")}
				onFocus={() => setIsInputFocused(true)}
				// TODO: animation lib
				onBlur={() => setTimeout(() => setIsInputFocused(false), 150)}
			/>
			<ul
				className={clsx(
					isInputFocused ? "block" : "hidden",
					"peer-focus:opacity-100 transition-opacity opacity-0 absolute z-10 w-full bg-base-100 bg-transparent backdrop-blur-lg shadow-2xl rounded-lg max-h-[70dvh] sm:max-h-[50dvh] overflow-auto",
				)}
			>
				{results.map((res) => (
					<li
						key={`${res.type}-${res.id}`}
						className="hover:bg-slate-400/40 rounded-md p-2"
					>
						<Link href={res.url}>
							<div className="text-sm font-bold">
								{tHeader(res.level)}/{res.relativeReadablePath}
							</div>
							{res.type === "content" && (
								<div className="text-sm text-base-content/60 text-nowrap overflow-hidden text-ellipsis">
									{res.contentSnippet}
								</div>
							)}
						</Link>
					</li>
				))}
				{results.length === 0 && (
					<div className="text-center flex justify-center p-8">
						<span className="loading loading-ring loading-lg" />
					</div>
				)}
			</ul>
		</div>
	);
};

function extractSnippet(text: string, query: string, snippetLength = 20) {
	const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());

	if (matchIndex === -1) return null; // 没找到匹配项

	const start = Math.max(0, matchIndex - snippetLength / 2);
	const end = Math.min(
		text.length,
		matchIndex + query.length + snippetLength / 2,
	);
	const snippetString = text.slice(start, end) + (end < text.length ? "" : "");
	return reactStringReplace(snippetString, query, (match, index) => (
		<b className="text-base-content" key={index}>
			{match}
		</b>
	));
}

export { Search };
