"use client";
import { checkAnswer } from "@/actions/check-answer";
import { createSuccessToast } from "@/hooks/use-toast";
import type { TopikQuestion } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const getAnswerOptions = (topikQuestion: TopikQuestion) => {
	return topikQuestion.options.findIndex((option) => option.isCorrect) + 1;
};

const QuestionForm = ({ topikQuestion }: { topikQuestion: TopikQuestion }) => {
	const router = useRouter();
	const [errors, setErrors] = useState("");
	const [showExplanation, setShowExplanation] = useState(false);

	const handleSubmit = checkAnswer.bind(null, topikQuestion);
	const nextNextQuestion = () => {
		router.push(
			`/topik/${topikQuestion.level}/${topikQuestion.no}/${Number(topikQuestion.questionNumber) + 1}`,
		);
	};
	const handleShowExplanation = () => {
		setShowExplanation((val) => !val);
	};
	return (
		<>
			<div className="text-xl font-bold">
				{topikQuestion.year}년 제{topikQuestion.no}회 - 문제{" "}
				{topikQuestion.questionNumber}
			</div>
			<h1
				className="text-xl whitespace-pre-line"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
				dangerouslySetInnerHTML={{
					__html: topikQuestion.questionStem.replace(/\\n/g, "&#10;"),
				}}
			/>
			<h2 className="text-xl">{topikQuestion.questionContent}</h2>
			<form
				action={async (formData) => {
					const result = await handleSubmit(formData);
					if (result?.errors) {
						setErrors(result.errors);
					} else {
						setErrors("");
						createSuccessToast("Success! Next question.");
						nextNextQuestion();
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
				<div className="flex gap-2">
					<button className="btn btn-sm mt-4" type="submit">
						提交
					</button>
					<button
						className="btn btn-sm mt-4"
						type="button"
						onClick={handleShowExplanation}
					>
						解析
					</button>
					<button
						className="btn btn-sm mt-4"
						type="button"
						onClick={nextNextQuestion}
					>
						下一题
					</button>
				</div>
			</form>
			{errors && <div className="text-red-500">{errors}</div>}
			{showExplanation && (
				<div>
					<p>答案： {getAnswerOptions(topikQuestion)}.</p>
					<p>解析：{topikQuestion.explanation}</p>
				</div>
			)}
		</>
	);
};

export default QuestionForm;
