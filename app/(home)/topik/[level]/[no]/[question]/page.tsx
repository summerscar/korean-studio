import { keystoneContext } from "@/../keystone/context";
import type { TopikQuestion } from "@/types";
import Link from "next/link";
import type { TopikLevelType } from ".keystone/types";

const TopikQuestionPage = async ({
	params,
}: { params: { level: TopikLevelType; no: string; question: string } }) => {
	const { level, no, question: questionNumber } = params;
	const topikQuestions = await keystoneContext.query.Topik.findMany({
		where: {
			level: { equals: level },
			no: { equals: Number(no) },
			questionNumber: { equals: Number(questionNumber) },
		},
		query:
			"id no year level questionNumber questionType score audioURL questionStem questionContent options explanation",
		orderBy: { questionNumber: "asc" },
	});

	if (topikQuestions.length === 0) {
		return <div>Question not found</div>;
	}
	const topikQuestion = topikQuestions[0] as TopikQuestion;
	return (
		<div className="flex flex-col gap-4">
			<div className="text-xl font-bold">
				第{topikQuestion.no}届 - No.{topikQuestion.questionNumber}
			</div>
			<h1 className="text-2xl font-bold">{topikQuestion.questionStem}</h1>
			<h2 className="text-xl">{topikQuestion.questionContent}</h2>
			<h3>
				{topikQuestion.options.map((option, index) => (
					<div key={option.content}>
						<input
							type="radio"
							name="options"
							value={index}
							id={index.toString()}
						/>
						<label htmlFor={index.toString()}>
							{index + 1}. {option.content}
						</label>
					</div>
				))}
			</h3>
			<h4>{topikQuestion.explanation}</h4>
			<button className="btn" type="button">
				<Link href={`/topik/${level}/${no}/${Number(questionNumber) + 1}`}>
					下一题
				</Link>
			</button>
		</div>
	);
};

export default TopikQuestionPage;
