import { getArticles } from "@/actions/article-actions";
import { notoKR } from "@/utils/fonts";
import { renderMDTextServer } from "@/utils/render-md-server";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const generateMetadata = async () => {
	const tHeader = await getTranslations("Header");

	return {
		title: tHeader("article"),
	};
};

const ArticlePage = async () => {
	const articles = await getArticles();

	return (
		<div className="container px-4 py-8 mx-auto">
			<div className="mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1024px]">
				{articles.map(async (article) => (
					<div
						key={article.id}
						className="card shadow-lg !rounded-xl backdrop-blur-lg bg-white/10"
					>
						<figure>
							<Link
								key={article.id}
								href={`/article/${article.id}`}
								className="block w-full"
							>
								<img
									src={article.poster || "/icon"}
									alt="poster"
									className="w-full aspect-video object-cover"
								/>
							</Link>
						</figure>
						<div
							className="card-body p-6"
							style={{ fontFamily: notoKR.style.fontFamily }}
						>
							<h2 className="card-title">{article.title}</h2>
							{await renderMDTextServer(article.description)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
export default ArticlePage;
