import { getArticles } from "@/actions/article-actions";
import { RenderMDTextServer } from "@/components/render-md-server";
import { notoKR } from "@/utils/fonts";
import { getTranslations } from "next-intl/server";
import { Link } from "next-view-transitions";
import { ArticleRemove } from "./[slug]/_components/article-remove";

export const generateMetadata = async () => {
	const tHeader = await getTranslations("Header");

	return {
		title: tHeader("article"),
	};
};

const ArticlePage = async () => {
	const articles = await getArticles();
	const sortedArticles = articles.toSorted((a, b) =>
		a.type === "MOVIE" ? -1 : b.type === "MOVIE" ? 1 : 0,
	);

	return (
		<div className="container px-4 py-8 mx-auto">
			<div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1024px]">
				{sortedArticles.map((article, index) => (
					<div
						key={article.id}
						className="card shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 !rounded-xl backdrop-blur-lg bg-white/10"
					>
						<figure
							style={{ viewTransitionName: `article-image-${article.id}` }}
						>
							<Link
								key={article.id}
								href={`/article/${article.id}`}
								className="block w-full"
								prefetch={article.type === "TEXT" && index < 6}
							>
								<img
									src={article.poster || "/icon"}
									alt="poster"
									className="w-full aspect-video object-cover rounded-lg"
								/>
							</Link>
						</figure>
						<div
							className="card-body p-6 justify-between"
							style={{ fontFamily: notoKR.style.fontFamily }}
						>
							<h2
								className="card-title"
								style={{ viewTransitionName: `article-title-${article.id}` }}
								// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
								dangerouslySetInnerHTML={{ __html: article.title }}
								lang="ko"
							/>
							<div
								style={{
									viewTransitionName: `article-description-${article.id}`,
								}}
							>
								<RenderMDTextServer text={article.description} />
							</div>
						</div>
						<ArticleRemove id={article.id} />
					</div>
				))}
			</div>
		</div>
	);
};
export default ArticlePage;
