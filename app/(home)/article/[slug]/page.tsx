import { keystoneContext } from "@/../keystone/context";
import { getArticles } from "@/actions/article-actions";
import {
	articleRevalidateKey,
	getArticleRevalidateKey,
} from "@/actions/user-dict-utils";
import type { SubtitleCues, SubtitleSeries } from "@/types/article";
import { notoKR } from "@/utils/fonts";
import { getBaseURL } from "@/utils/get-base-url";
import { renderMDTextServer } from "@/utils/render-md-server";
import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";
import { EPSelect } from "./_components/ep-select";
import { ArticleMovie } from "./_components/movie";

const getArticle = cache(
	async (slug: string) =>
		await unstable_cache(
			async () => {
				return await keystoneContext.db.Article.findOne({
					where: { id: slug },
				});
			},
			[getArticleRevalidateKey(slug)],
			{
				revalidate: false,
				tags: [getArticleRevalidateKey(slug), articleRevalidateKey],
			},
		)(),
);

export const generateMetadata = async ({
	params,
}: { params: Promise<{ slug: string }> }) => {
	const slug = (await params).slug;
	const tHeader = await getTranslations("Header");
	const article = await getArticle(slug);
	if (!article) return { title: "404" };
	return {
		title: `${article.title} - ${tHeader("article")}`,
		description: article.description,
	};
};

export const generateStaticParams = async () => {
	return (await getArticles()).map((article) => ({
		slug: article.id,
	}));
};

const SlugPage = async ({
	params,
	searchParams,
}: {
	params: Promise<{ slug: string }>;
	searchParams: Promise<{ ep: string }>;
}) => {
	const slug = (await params).slug;
	const ep = (await searchParams).ep;
	const article = await getArticle(slug);

	if (!article) redirect("/article");
	let children: React.ReactNode;

	if (article.type === "MOVIE") {
		const epIndex = Number.parseInt(ep || "0");

		const defaultEpisode = ((article.subtitles || []) as SubtitleSeries)[
			epIndex
		];
		if (!defaultEpisode) redirect("/article");

		const krSubtitle = defaultEpisode.subtitles.ko.filename;
		const subtitleCues = (await (
			await fetch(`${getBaseURL()}/subtitle-text/${krSubtitle}`)
		).json()) as SubtitleCues;

		children = (
			<ArticleMovie
				defaultSubtitleCues={subtitleCues}
				subtitleSeries={article.subtitles as SubtitleSeries}
			/>
		);
	}

	return (
		<div className={clsx("container px-4 py-8 max-w-[1024px] mx-auto")}>
			<div className="flex flex-col md:flex-row gap-8 mb-8">
				{article.poster && (
					<div className="w-full md:w-1/3">
						<img
							src={article.poster}
							alt={article.title}
							className="w-full h-auto rounded-lg shadow-lg object-cover"
						/>
					</div>
				)}
				<div className="flex-1 flex flex-col">
					<div
						className="text-4xl font-bold mb-4 leading-tight"
						style={{ fontFamily: notoKR.style.fontFamily }}
					>
						{article.title}
					</div>
					<div
						className="text-base text-base-content/70 leading-relaxed flex-grow"
						style={{ fontFamily: notoKR.style.fontFamily }}
					>
						{renderMDTextServer(article.description)}
					</div>
					{article.type === "MOVIE" && <EPSelect article={article} />}
				</div>
			</div>
			{children}
		</div>
	);
};

export default SlugPage;
