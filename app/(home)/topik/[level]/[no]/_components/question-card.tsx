"use client";
import { JSONEditor } from "@/components/json-editor";
import {
	createErrorToast,
	createLoadingToast,
	createSuccessToast,
} from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import type { TopikQuestion } from "@/types";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ActionBar } from "./action-bar";
import { AnswerPanel } from "./answer-panel";
import type { TopikLevelType, TopikUpdateInput } from ".keystone/types";

export type FormResult = {
	answer: number;
	isCorrect: boolean;
	score: number;
}[];

export const getOptionContent = (content: string) => {
	if (content.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
		return (
			<img
				src={`${process.env.NEXT_PUBLIC_BLOB_BASE_URL}${content}`}
				className="w-52 object-contain"
				alt="option"
			/>
		);
	}
	return content;
};

export const getQuestionStem = (questionStem: string) => {
	if (!questionStem) return;
	if (questionStem.match(/\.(jpg|jpeg|png|gif|bmp|svg)$/i)) {
		return (
			<img
				src={`${process.env.NEXT_PUBLIC_BLOB_BASE_URL}${questionStem}`}
				className="h-80 object-contain"
				alt="option"
			/>
		);
	}
	return (
		<p
			className="whitespace-pre-line p-3 mb-2 rounded-sm border border-base-content"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
			dangerouslySetInnerHTML={{
				__html: questionStem.replace(/\\n/g, "&#10;"),
			}}
		/>
	);
};

const QuestionCard = ({
	topikQuestions,
	level,
	no,
	isTesting,
	timeLeft,
	onUpdateQuestionItem,
}: {
	topikQuestions: TopikQuestion[];
	level: TopikLevelType;
	no: string;
	isTesting: boolean;
	timeLeft: number;
	onUpdateQuestionItem: (id: string, data: TopikUpdateInput) => void;
}) => {
	const { isAdmin } = useUser();
	const formRef = useRef<HTMLFormElement>(null);
	const [formResult, setFormResult] = useState<FormResult>([]);
	const [isEnd, setIsEnd] = useState(false);
	const [editing, setEditing] = useState<TopikUpdateInput | null>(null);

	useEffect(() => {
		if (isTesting) {
			const cb = (event: Event) => {
				const formData = new FormData(event.currentTarget as HTMLFormElement);
				const data = Object.entries(Object.fromEntries(formData)).reduce(
					(prev, [key, value]) => {
						prev[Number(key)] = {
							answer: Number(value),
							isCorrect:
								topikQuestions[Number(key)].options.findIndex(
									(_) => _.isCorrect,
								) === Number(value),
							score: topikQuestions[Number(key)].score,
						};
						return prev;
					},
					[] as FormResult,
				);
				setFormResult(data);
			};
			formRef.current?.addEventListener("change", cb);
			return () => formRef.current?.removeEventListener("change", cb);
		}
	}, [isTesting, topikQuestions]);

	const handleClickEndTest = () => {
		setIsEnd(true);
	};

	const handleClickResetTest = () => {
		formRef.current?.reset();
		setIsEnd(false);
		setFormResult([]);
	};

	return (
		<div className="flex items-start mobile:flex-col-reverse">
			<div className="flex-auto pr-3 pt-8 max-w-3xl">
				<form ref={formRef}>
					{topikQuestions.map((topikQuestion) => (
						<div
							className="flex flex-col py-4 [scroll-margin-top:var(--header-height)]"
							id={topikQuestion.questionNumber.toString()}
							key={topikQuestion.id}
						>
							{editing?.questionNumber === topikQuestion.questionNumber && (
								<JSONEditor
									editingJSON={editing}
									onUpdate={async (data: TopikUpdateInput) => {
										let cancel = () => {};
										try {
											cancel = createLoadingToast("updating");
											await onUpdateQuestionItem(topikQuestion.id, data);
											createSuccessToast("updated");
											// biome-ignore lint/suspicious/noExplicitAny: <explanation>
										} catch (error: any) {
											createErrorToast(error.message);
											console.error(error);
										} finally {
											cancel();
											setEditing(null);
										}
									}}
									onCancel={() => setEditing(null)}
								/>
							)}
							{topikQuestion.questionType !== "LISTENING" &&
								topikQuestion.questionStem &&
								getQuestionStem(topikQuestion.questionStem)}
							<div className="mb-2 relative">
								{isAdmin && (
									<div className="absolute -left-8 top-0">
										<button
											type="button"
											className="btn btn-circle btn-xs btn-warning"
											onClick={() => {
												setEditing({
													questionNumber: topikQuestion.questionNumber,
													questionContent: topikQuestion.questionContent,
													explanation: topikQuestion.explanation,
													questionStem: topikQuestion.questionStem,
													options: topikQuestion.options,
													audioURL: topikQuestion.audioURL,
													score: topikQuestion.score,
													questionType: topikQuestion.questionType,
												});
											}}
										>
											🖋
										</button>
									</div>
								)}
								<Link
									target="_blank"
									className="hover:underline font-bold"
									href={`/topik/${level}/${no}/${topikQuestion.questionNumber}`}
								>
									{topikQuestion.questionNumber}.
								</Link>
								<span> </span>
								{topikQuestion.questionContent}
							</div>
							<fieldset
								id={`no-${topikQuestion.questionNumber}`}
								className="grid gap-2 grid-cols-1 sm:grid-cols-2"
							>
								{topikQuestion.options.map((option, index) => {
									const radioId = `${topikQuestion.questionNumber - 1}`;
									return (
										<div
											key={`no-${topikQuestion.questionNumber}-${index}`}
											className={clsx(
												"rounded-sm",
												option.isCorrect &&
													(isAdmin || isEnd) &&
													"bg-success/50",
												isEnd &&
													!option.isCorrect &&
													formResult?.[topikQuestion.questionNumber - 1]
														?.answer === index &&
													"bg-error/50",
											)}
										>
											<input
												type="radio"
												className="radio radio-xs radio-secondary"
												disabled={!isTesting || isEnd}
												name={radioId}
												value={index}
												id={`${radioId}-${index}`}
											/>
											<span> </span>
											<label
												className={clsx(
													isTesting && !isEnd && "cursor-pointer",
												)}
												htmlFor={`${radioId}-${index}`}
											>
												{index + 1}. {getOptionContent(option.content)}
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
			<AnswerPanel
				isEnd={isEnd}
				formResult={formResult}
				topikQuestions={topikQuestions}
			>
				<ActionBar
					onSubmit={handleClickEndTest}
					onReset={handleClickResetTest}
					level={level}
					no={no}
					isTesting={isTesting}
					timeLeft={timeLeft}
					audioURL={`${process.env.NEXT_PUBLIC_BLOB_BASE_URL}${topikQuestions[0].audioURL}`}
					isEnd={isEnd}
				/>
			</AnswerPanel>
		</div>
	);
};

export { QuestionCard };
