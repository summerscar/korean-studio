import { keystoneContext } from "@/../keystone/context";
import ArrowLeftIcon from "@/assets/svg/arrow-left.svg";
import QuestionForm from "@/components/question-form";
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

	const normalizedTopikQuestion = JSON.parse(JSON.stringify(topikQuestion));

	return (
		<>
			<nav>
				<Link href={`/topik/${level}/${no}`}>
					<ArrowLeftIcon />
				</Link>
			</nav>
			<div className="flex flex-col gap-2">
				<QuestionForm topikQuestion={normalizedTopikQuestion} />
			</div>
		</>
	);
};

export default TopikQuestionPage;
