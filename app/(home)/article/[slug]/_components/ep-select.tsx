"use client";
import type { SubtitleSeries } from "@/types/article";
import { useSearchParams } from "next/navigation";
import type { Lists } from ".keystone/types";

const EPSelect = ({ article }: { article: Lists.Article.Item }) => {
	const searchParams = useSearchParams();

	const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		history.pushState({}, "", `/article/${article.id}?ep=${e.target.value}`);
	};

	if (!article.subtitles) return null;

	return (
		<select
			className="select select-bordered w-full max-w-xs mt-6"
			onChange={onChange}
			value={searchParams.get("ep") || "0"}
		>
			{(article.subtitles as SubtitleSeries).map((subtitle, index) => (
				<option key={subtitle.title} value={index}>
					{subtitle.title}
				</option>
			))}
		</select>
	);
};

export { EPSelect };
