import { keystoneContext } from "@/../keystone/context";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata(): Promise<Metadata> {
	const tIndex = await getServerI18n("Index");
	return {
		title: `${tIndex("title")}-TOPIK`,
	};
}

// "id no year level questionNumber questionType score audioURL questionStem questionContent options explanation",

export default async function Topik() {
	const levelCategories: {
		label: string;
		value: TopikLevelType;
		items: number[];
	}[] = [
		{ label: "TOPIK I", value: "TOPIK_I", items: [] },
		{ label: "TOPIK II", value: "TOPIK_II", items: [] },
	];

	const topikList = await keystoneContext.query.Topik.findMany({
		where: {},
		query: "no level questionNumber",
	});

	levelCategories.forEach((category) => {
		category.items = [
			...new Set(
				topikList
					.filter((item) => item.level === category.value)
					.map((item) => item.no),
			),
		];
	});

	return (
		<div>
			<h1>Topik</h1>
			<div className="flex flex-col">
				{levelCategories.map((category) => (
					<div key={category.value}>
						<h2>{category.label}</h2>
						<ul>
							{category.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
