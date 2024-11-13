import { keystoneContext } from "@/../keystone/context";
import { TopikLevels, type TopikQuestion } from "@/types";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import QuestionForm from "./_components/question-form";
import type { TopikLevelType } from ".keystone/types";

export async function generateMetadata(props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
}): Promise<Metadata> {
	const params = await props.params;
	return {
		title: `${TopikLevels[params.level]}-${params.no}th-${params.question}`,
	};
}

const getTopikQuestionByLevelNoQuestionNumberKey = (
	level: TopikLevelType,
	no: string,
	questionNumber: string,
) => `TopikQuestionByLevelNoQuestionNumber-${level}-${no}-${questionNumber}`;

const TopikQuestionPage = async (props: {
	params: Promise<{ level: TopikLevelType; no: string; question: string }>;
}) => {
	const params = await props.params;
	const { level, no, question: questionNumber } = params;
	const getTopikQuestions = await unstable_cache(
		async (level: TopikLevelType, no: string, questionNumber: string) => {
			return await keystoneContext.query.Topik.findMany({
				where: {
					level: { equals: level },
					no: { equals: Number(no) },
					questionNumber: { equals: Number(questionNumber) },
				},
				query:
					"id no year level questionNumber questionType score audioURL questionStem questionContent options explanation",
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
	const topikQuestion = topikQuestions[0] as TopikQuestion;

	const normalizedTopikQuestion = JSON.parse(JSON.stringify(topikQuestion));

	return (
		<div className="flex flex-col gap-2">
			<QuestionForm topikQuestion={normalizedTopikQuestion} />
		</div>
	);
};

export default TopikQuestionPage;
