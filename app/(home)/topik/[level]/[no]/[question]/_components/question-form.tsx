"use client";
import { createSuccessToast } from "@/hooks/use-toast";
import type { TopikQuestion } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
	getOptionContent,
	getQuestionStem,
} from "../../_components/question-card";

export const getAnswerOptions = (topikQuestion: TopikQuestion) => {
	return topikQuestion.options.findIndex((option) => option.isCorrect) + 1;
};

const QuestionForm = ({ topikQuestion }: { topikQuestion: TopikQuestion }) => {
	const router = useRouter();
	const [errors, setErrors] = useState("");
	const [showExplanation, setShowExplanation] = useState(false);

	const handleSubmit = async (formData: FormData) => {
		const selectedOption = formData.get("options") as string;
		const correctOptionIndex = topikQuestion.options.findIndex(
			(option) => option.isCorrect,
		);
		if (!selectedOption) {
			return {
				errors: "Please select an option",
			};
		}
		if (correctOptionIndex !== Number(selectedOption)) {
			return {
				errors: "Incorrect",
			};
		}
	};

	const prevQuestion = () => {
		router.push(
			`/topik/${topikQuestion.level}/${topikQuestion.no}/${Number(topikQuestion.questionNumber) - 1}`,
		);
	};
	const nextQuestion = () => {
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
			{getQuestionStem(topikQuestion.questionStem)}
			<h2 className="text-xl">{topikQuestion.questionContent}</h2>
			<form
				action={async (formData) => {
					const result = await handleSubmit(formData);
					if (result?.errors) {
						setErrors(result.errors);
					} else {
						setErrors("");
						createSuccessToast("Next question.");
						nextQuestion();
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
							{index + 1}. {getOptionContent(option.content)}
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
						onClick={prevQuestion}
					>
						上一题
					</button>
					<button
						className="btn btn-sm mt-4"
						type="button"
						onClick={nextQuestion}
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
