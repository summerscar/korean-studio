import { keystoneContext } from "@/../keystone/context";
import type { TopikQuestion } from "@/types";
import Link from "next/link";
import type { TopikLevelType } from ".keystone/types";
const TopikQuestionPage = async ({
	params,
}: { params: { level: TopikLevelType; no: string } }) => {
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
			{topikQuestions.map((topikQuestion) => (
				<div className="flex flex-col my-4" key={topikQuestion.id}>
					<div className="text-xl font-bold">
						<Link
							href={`/topik/${level}/${no}/${topikQuestion.questionNumber}`}
						>
							第{topikQuestion.no}届 - No.{topikQuestion.questionNumber}
						</Link>
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
				</div>
			))}
		</div>
	);
};

export default TopikQuestionPage;
