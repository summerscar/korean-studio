import type { TopikQuestion } from "@/types";

const AnswerPanel = ({
	topikQuestions,
}: { topikQuestions: TopikQuestion[] }) => {
	return (
		<div className="flex-none w-64 sticky top-[--header-height] min-h-48 border-l border-base-content p-2">
			<h2>answer</h2>
			<div className="flex gap-2 flex-wrap">
				{topikQuestions.map((topikQuestion) => (
					<a
						href={`#${topikQuestion.questionNumber}`}
						key={topikQuestion.id}
						className="w-10 h-10 text-center leading-10 rounded-md border cursor-pointer select-none border-base-content"
					>
						{topikQuestion.questionNumber}
					</a>
				))}
			</div>
		</div>
	);
};

export { AnswerPanel };
