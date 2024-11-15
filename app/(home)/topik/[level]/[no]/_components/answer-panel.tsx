import type { TopikQuestion } from "@/types";
import clsx from "clsx";
import type { FormResult } from "./question-card";

const AnswerPanel = ({
	topikQuestions,
	formResult,
	isEnd,
	children,
}: {
	topikQuestions: TopikQuestion[];
	formResult: FormResult;
	isEnd: boolean;
	children: React.ReactNode;
}) => {
	return (
		<div className="flex-none w-80 sm:sticky sm:top-[--header-height] sm:min-h-48 sm:border-l border-base-content p-2 sm:max-h-[calc(100dvh-var(--header-height))] overflow-auto">
			<div className="mb-2 text-xl">
				Score:{" "}
				{isEnd
					? formResult.reduce((a, b) => a + (b.isCorrect ? b.score : 0), 0)
					: "-"}
			</div>
			{children}
			<div className="flex gap-3 flex-wrap">
				{topikQuestions.map((topikQuestion) => (
					<a
						href={`#${topikQuestion.questionNumber}`}
						key={topikQuestion.id}
						className={clsx(
							"w-10 h-10 text-center leading-10 rounded-md  cursor-pointer select-none outline-dashed outline-1 outline-base-content",
							{
								"outline-double bg-base-content/10":
									!!formResult?.[topikQuestion.questionNumber - 1]?.answer,
								"!bg-error":
									isEnd &&
									!formResult?.[topikQuestion.questionNumber - 1]?.isCorrect,
								"!bg-success":
									isEnd &&
									formResult?.[topikQuestion.questionNumber - 1]?.isCorrect,
							},
						)}
					>
						{topikQuestion.questionNumber}
					</a>
				))}
			</div>
		</div>
	);
};

export { AnswerPanel };
