import { keystoneContext } from "@/../keystone/context";
import { isTestStart } from "@/actions/topik-actions";
import { TopikLevels, type TopikQuestion } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionBar } from "./_components/action-bar";
import { AnswerPanel } from "./_components/answer-panel";
import { QuestionCard } from "./_components/question-card";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata(props: {
	params: Promise<{ level: TopikLevelType; no: string }>;
}): Promise<Metadata> {
	const params = await props.params;
	return {
		title: `${TopikLevels[params.level]}-${params.no}th`,
	};
}

export default async function NoPage(props: {
	params: Promise<{ level: TopikLevelType; no: string }>;
}) {
	const params = await props.params;
	const { isStart: isTesting, timeLeft } = await isTestStart(
		params.level,
		params.no,
	);
	const { level, no } = params;
	const topikListByLevelAndNo = await keystoneContext.query.Topik.findMany({
		where: { level: { equals: level }, no: { equals: Number(no) } },
		query:
			"id no year level questionNumber questionType score audioURL questionStem questionContent options explanation",
		orderBy: { questionNumber: "asc" },
	});
	if (topikListByLevelAndNo.length === 0) {
		return <div>Questions not found</div>;
	}

	const topikQuestions = JSON.parse(
		JSON.stringify(topikListByLevelAndNo),
	) as TopikQuestion[];

	return (
		<div>
			<h1 className="text-2xl font-bold">
				{topikQuestions[0].year}년 제{topikQuestions[0].no}회
			</h1>
			<QuestionCard
				topikQuestions={topikQuestions}
				level={level}
				no={no}
				timeLeft={timeLeft}
				isTesting={isTesting}
			/>
		</div>
	);
}
