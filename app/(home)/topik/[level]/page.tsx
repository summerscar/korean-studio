import { keystoneContext } from "@/../keystone/context";
import ArrowLeftIcon from "@/assets/svg/arrow-left.svg";
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
			{/* TODO: breadcrumb */}
			<nav>
				<Link href="/topik">
					<ArrowLeftIcon />
				</Link>
			</nav>
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
};

export default TopikLevelPage;
