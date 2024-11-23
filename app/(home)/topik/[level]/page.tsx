import { keystoneContext } from "@/../keystone/context";
import { TopikLevels } from "@/types";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata(props: {
	params: Promise<{ level: TopikLevelType }>;
}): Promise<Metadata> {
	const params = await props.params;
	const tIndex = await getTranslations("Index");
	return {
		title: `${tIndex("title")}-${TopikLevels[params.level]}`,
	};
}

const getTopikListByLevelKey = (level: TopikLevelType) =>
	`TopikListByLevel-${level}`;

export default async function LevelPage(props: {
	params: Promise<{ level: TopikLevelType }>;
}) {
	const params = await props.params;
	const { level } = params;

	const getTopikListByLevel = unstable_cache(
		async (level: TopikLevelType) => {
			const topikListByLevel = await keystoneContext.query.Topik.findMany({
				where: { level: { equals: level } },
				orderBy: { no: "asc" },
				query: "no",
			});
			return topikListByLevel;
		},
		[getTopikListByLevelKey(level)],
		{ revalidate: false, tags: [getTopikListByLevelKey(level)] },
	);

	const topikListByLevel = await getTopikListByLevel(level);

	return (
		<div className="flex flex-col">
			<h1 className="text-2xl font-bold mb-4">{TopikLevels[level]}</h1>
			<ul>
				{[...new Set(topikListByLevel.map((item) => item.no))].map((no) => (
					<li key={no}>
						<Link className="hover:underline" href={`/topik/${level}/${no}`}>
							제{no}회
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
