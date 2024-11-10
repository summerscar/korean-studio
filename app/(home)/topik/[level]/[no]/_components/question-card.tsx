"use client";
import type { TopikQuestion } from "@/types";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActionBar } from "./action-bar";
import { AnswerPanel } from "./answer-panel";
import type { TopikLevelType } from ".keystone/types";

const QuestionCard = ({
	topikQuestions,
	level,
	no,
	isTesting,
	timeLeft,
}: {
	topikQuestions: TopikQuestion[];
	level: TopikLevelType;
	no: string;
	isTesting: boolean;
	timeLeft: number;
}) => {
	const formRef = useRef<HTMLFormElement>(null);
	const [formResult, setFormResult] =
		useState<Record<string, FormDataEntryValue>>();

	useEffect(() => {
		if (isTesting) {
			const cb = (event: Event) => {
				const formData = new FormData(event.currentTarget as HTMLFormElement);
				const formProps = Object.fromEntries(formData);
				setFormResult(formProps);
				console.log("formProps:", formProps);
			};
			formRef.current?.addEventListener("change", cb);
			return () => formRef.current?.removeEventListener("change", cb);
		}
	}, [isTesting]);

	const handleClickStartTest = () => {
		formRef.current?.requestSubmit();
	};

	const handleClickResetTest = () => {
		formRef.current?.reset();
		setFormResult({});
	};

	return (
		<div className="flex items-start">
			<div className="flex-auto pr-3 pt-8">
				<ActionBar
					onSubmit={handleClickStartTest}
					onReset={handleClickResetTest}
					level={level}
					no={no}
					isTesting={isTesting}
					timeLeft={timeLeft}
					audioURL={topikQuestions[0].audioURL}
				/>
				<form ref={formRef}>
					{topikQuestions.map((topikQuestion) => (
						<div
							className="flex flex-col my-4 [scroll-margin-top:var(--header-height)]"
							id={topikQuestion.questionNumber.toString()}
							key={topikQuestion.id}
						>
							{topikQuestion.questionType !== "LISTENING" && (
								<p
									className="whitespace-pre-line py-4"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
									dangerouslySetInnerHTML={{
										__html: topikQuestion.questionStem.replace(/\\n/g, "&#10;"),
									}}
								/>
							)}
							<div>
								<Link
									className="hover:underline font-bold"
									href={`/topik/${level}/${no}/${topikQuestion.questionNumber}`}
								>
									{topikQuestion.questionNumber}.
								</Link>
								<span> </span>
								{topikQuestion.questionContent}
							</div>
							<fieldset id={`no-${topikQuestion.questionNumber}`}>
								{topikQuestion.options.map((option, index) => {
									const radioId = `${topikQuestion.questionNumber}`;
									return (
										<div key={`no-${topikQuestion.questionNumber}-${index}`}>
											<input
												type="radio"
												className="radio radio-xs radio-secondary"
												disabled={!isTesting}
												name={radioId}
												value={index}
												id={`${radioId}-${index}`}
											/>
											<span> </span>
											<label htmlFor={`${radioId}-${index}`}>
												{index + 1}. {option.content}
											</label>
										</div>
									);
								})}
							</fieldset>
							<h4>{topikQuestion.explanation}</h4>
						</div>
					))}
				</form>
			</div>
			{isTesting && (
				<AnswerPanel formResult={formResult} topikQuestions={topikQuestions} />
			)}
		</div>
	);
};

export { QuestionCard };
