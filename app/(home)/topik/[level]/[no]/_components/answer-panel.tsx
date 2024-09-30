import type { TopikQuestion } from "@/types";
import clsx from "clsx";

const AnswerPanel = ({
	topikQuestions,
	formResult,
}: {
	topikQuestions: TopikQuestion[];
	formResult?: Record<string, FormDataEntryValue>;
}) => {
	return (
		<div className="flex-none w-64 sticky top-[--header-height] min-h-48 border-l border-base-content p-2">
			<div className="flex gap-2 flex-wrap">
				{topikQuestions.map((topikQuestion) => (
					<a
						href={`#${topikQuestion.questionNumber}`}
						key={topikQuestion.id}
						className={clsx(
							"w-10 h-10 text-center leading-10 rounded-md  cursor-pointer select-none outline-dashed outline-1 outline-base-content",
							{
								"outline-double": !!formResult?.[topikQuestion.questionNumber],
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
