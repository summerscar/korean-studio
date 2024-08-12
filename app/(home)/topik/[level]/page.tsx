import { keystoneContext } from "@/../keystone/context";
import { TopikLevels } from "@/types";
import Link from "next/link";
import type { TopikLevelType } from ".keystone/types";

const TopikLevelPage = async ({
	params,
}: { params: { level: TopikLevelType } }) => {
	const { level } = params;
	const topikListByLevel = await keystoneContext.query.Topik.findMany({
		where: { level: { equals: level } },
		orderBy: { no: "asc" },
		query: "no",
	});

	return (
		<div className="flex flex-col items-center">
			<h1>{TopikLevels[level]}</h1>
			<ul>
				{[...new Set(topikListByLevel.map((item) => item.no))].map((no) => (
					<li key={no}>
						<Link href={`/topik/${level}/${no}`}>第{no}届</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default TopikLevelPage;
