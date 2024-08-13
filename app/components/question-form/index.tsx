"use client";
import { checkAnswer } from "@/actions/check-answer";
import type { TopikQuestion } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

const QuestionForm = ({ topikQuestion }: { topikQuestion: TopikQuestion }) => {
	const router = useRouter();
	const [errors, setErrors] = useState("");
	const handleSubmit = checkAnswer.bind(null, topikQuestion);

	return (
		<>
			<div className="text-xl font-bold">
				{topikQuestion.year}년 제{topikQuestion.no}회 - 문제{" "}
				{topikQuestion.questionNumber}
			</div>
			<h1 className="text-2xl font-bold">{topikQuestion.questionStem}</h1>
			<h2 className="text-xl">{topikQuestion.questionContent}</h2>
			<form
				action={async (formData) => {
					const result = await handleSubmit(formData);
					if (result?.errors) {
						setErrors(result.errors);
					} else {
						setErrors("");
						router.push(
							`/topik/${topikQuestion.level}/${topikQuestion.no}/${Number(topikQuestion.questionNumber) + 1}`,
						);
					}
				}}
			>
				{topikQuestion.options.map((option, index) => (
					<div key={option.content}>
						<input
							type="radio"
							name="options"
							className="radio radio-xs radio-secondary"
							value={index}
							id={index.toString()}
						/>
						<span> </span>
						<label htmlFor={index.toString()}>
							{index + 1}. {option.content}
						</label>
					</div>
				))}
				<button className="btn btn-sm mt-4" type="submit">
					제출
				</button>
			</form>
			{errors && <div className="text-red-500">{errors}</div>}
			<h4>{topikQuestion.explanation}</h4>
		</>
	);
};

export default QuestionForm;
