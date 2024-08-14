import { keystoneContext } from "@/../keystone/context";
import { TopikLevels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata({
	params,
}: { params: { level: TopikLevelType } }): Promise<Metadata> {
	const tIndex = await getServerI18n("Index");
	return {
		title: `${tIndex("title")}-${TopikLevels[params.level]}`,
	};
}

export default async function Page({
	params,
}: { params: { level: TopikLevelType } }) {
	const { level } = params;
	const topikListByLevel = await keystoneContext.query.Topik.findMany({
		where: { level: { equals: level } },
		orderBy: { no: "asc" },
		query: "no",
	});

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
