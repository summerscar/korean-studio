import { keystoneContext } from "@/../keystone/context";
import { isTestStart } from "@/actions/topik-actions";
import { TopikLevels, type TopikQuestion } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionBar } from "./_components/action-bar";
import { AnswerPanel } from "./_components/answer-panel";
import { TestCutDown } from "./_components/count-down";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata({
	params,
}: { params: { level: TopikLevelType; no: string } }): Promise<Metadata> {
	return {
		title: `${TopikLevels[params.level]}-${params.no}th`,
	};
}

export default async function NoPage({
	params,
}: { params: { level: TopikLevelType; no: string } }) {
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

	const topikQuestions = topikListByLevelAndNo as TopikQuestion[];
	return (
		<div>
			<h1 className="text-2xl font-bold">
				{topikQuestions[0].year}년 제{topikQuestions[0].no}회
				{isTesting && (
					<>
						{" "}
						<TestCutDown timeLeft={timeLeft} />
					</>
				)}
			</h1>
			<div className="flex items-start">
				<div className="flex-auto">
					{topikQuestions.map((topikQuestion) => (
						<div
							className="flex flex-col my-4"
							id={topikQuestion.questionNumber.toString()}
							key={topikQuestion.id}
						>
							<h1>{topikQuestion.questionStem}</h1>
							<div>
								<Link
									className="hover:underline font-bold"
									href={`/topik/${level}/${no}/${topikQuestion.questionNumber}`}
								>
									{topikQuestion.questionNumber}.
								</Link>
								<span> </span>
								{topikQuestion.questionContent}
							</div>
							<h3>
								{topikQuestion.options.map((option, index) => {
									const id =
										topikQuestion.questionNumber.toString() + index.toString();
									return (
										<div key={option.content}>
											{/* TODO: group radio */}
											<input
												type="radio"
												className="radio radio-xs radio-secondary"
												disabled={!isTesting}
												name="options"
												value={index}
												id={id}
											/>
											<span> </span>
											<label htmlFor={id}>
												{index + 1}. {option.content}
											</label>
										</div>
									);
								})}
							</h3>
							<h4>{topikQuestion.explanation}</h4>
						</div>
					))}
				</div>
				<AnswerPanel topikQuestions={topikQuestions} />
			</div>

			<ActionBar level={level} no={no} isTesting={isTesting} />
		</div>
	);
}
