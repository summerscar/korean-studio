import { keystoneContext } from "@/../keystone/context";
import { TopikLevels } from "@/types";
import { getServerI18n } from "@/utils/i18n";
import type { Metadata } from "next";
import Link from "next/link";
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
		{ label: TopikLevels.TOPIK_I, value: "TOPIK_I", items: [] },
		{ label: TopikLevels.TOPIK_II, value: "TOPIK_II", items: [] },
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
		<div className="flex justify-center items-center flex-col">
			<div className="flex flex-col">
				{levelCategories.map((category) => (
					<div key={category.value} className="last:mt-8">
						<h2 className="text-2xl font-bold hover:underline mb-4">
							<Link href={`/topik/${category.value}`}>{category.label}</Link>
						</h2>
						<ul>
							{category.items.map((no) => (
								<li className="text-center" key={no}>
									<Link
										className="hover:underline"
										href={`/topik/${category.value}/${no}`}
									>
										제{no}회
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</div>
	);
}
