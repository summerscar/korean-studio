import { keystoneContext } from "@/../keystone/context";
import { unstable_cache } from "next/cache";
import QuestionForm from "./question-form";
import type { TopikLevelType } from ".keystone/types";

const getTopikQuestionByLevelNoQuestionNumberKey = (
	level: TopikLevelType,
	no: string,
	questionNumber: string,
) => `TopikQuestionByLevelNoQuestionNumber-${level}-${no}-${questionNumber}`;

export const TopikQuestionPage = async (props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
	isModal?: boolean;
}) => {
	const params = await props.params;
	const { level, no, question: questionNumber } = params;
	const getTopikQuestions = await unstable_cache(
		async (level: TopikLevelType, no: string, questionNumber: string) => {
			return await keystoneContext.db.Topik.findMany({
				where: {
					level: { equals: level },
					no: { equals: Number(no) },
					questionNumber: { equals: Number(questionNumber) },
				},
				orderBy: { questionNumber: "asc" },
			});
		},
		[getTopikQuestionByLevelNoQuestionNumberKey(level, no, questionNumber)],
		{
			revalidate: false,
			tags: [
				getTopikQuestionByLevelNoQuestionNumberKey(level, no, questionNumber),
			],
		},
	);
	const topikQuestions = await getTopikQuestions(level, no, questionNumber);
	if (topikQuestions.length === 0) {
		return <div>Question not found</div>;
	}
	const topikQuestion = topikQuestions[0];

	const normalizedTopikQuestion = JSON.parse(JSON.stringify(topikQuestion));

	return (
		<div className="flex flex-col gap-2">
			<QuestionForm
				isModal={props.isModal}
				topikQuestion={normalizedTopikQuestion}
			/>
		</div>
	);
};
