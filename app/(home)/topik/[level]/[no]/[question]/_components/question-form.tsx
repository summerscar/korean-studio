"use client";
import { createSuccessToast } from "@/hooks/use-toast";
import type { TopikQuestion } from "@/types";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
	getOptionContent,
	getQuestionContent,
	getQuestionStem,
	getQuestionSubContent,
} from "../../_components/question-card";

export const getAnswerOptions = (topikQuestion: TopikQuestion) => {
	return topikQuestion.options.findIndex((option) => option.isCorrect) + 1;
};

const QuestionForm = ({
	topikQuestion,
	isModal,
}: {
	topikQuestion: TopikQuestion;
	isModal?: boolean;
}) => {
	const router = useRouter();
	const [errors, setErrors] = useState("");
	const [showExplanation, setShowExplanation] = useState(false);
	const tTopik = useTranslations("Topik");
	const pathname = usePathname();

	const handleSubmit = async (formData: FormData) => {
		const selectedOption = formData.get("options") as string;
		const correctOptionIndex = topikQuestion.options.findIndex(
			(option) => option.isCorrect,
		);
		if (!selectedOption) {
			return {
				errors: tTopik("unSelectedTips"),
			};
		}
		if (correctOptionIndex !== Number(selectedOption)) {
			return {
				errors: tTopik("incorrect"),
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
			{getQuestionContent(topikQuestion.questionContent)}
			{getQuestionSubContent(topikQuestion.questionContent)}
			<form
				action={async (formData) => {
					const result = await handleSubmit(formData);
					if (result?.errors) {
						setErrors(result.errors);
					} else {
						setErrors("");
						createSuccessToast(`🎉 ${tTopik("next")}!`);
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
						{tTopik("submit")}
					</button>
					<button
						className="btn btn-sm mt-4"
						type="button"
						onClick={handleShowExplanation}
					>
						{tTopik("explain")}
					</button>
					{!isModal && (
						<>
							<button
								className="btn btn-sm mt-4"
								type="button"
								onClick={prevQuestion}
							>
								{tTopik("prev")}
							</button>
							<button
								className="btn btn-sm mt-4"
								type="button"
								onClick={nextQuestion}
							>
								{tTopik("next")}
							</button>
						</>
					)}
					{isModal && (
						<button
							className="btn btn-sm mt-4"
							type="button"
							onClick={() => router.back()}
						>
							<Link href={pathname} target="_blank">
								↗️
							</Link>
						</button>
					)}
				</div>
			</form>
			{errors && <div className="text-red-500">{errors}</div>}
			{showExplanation && (
				<div>
					<p>
						{tTopik("answer")}: {getAnswerOptions(topikQuestion)}.
					</p>
					<p>
						{tTopik("explain")}: {topikQuestion.explanation}
					</p>
				</div>
			)}
		</>
	);
};

export default QuestionForm;
