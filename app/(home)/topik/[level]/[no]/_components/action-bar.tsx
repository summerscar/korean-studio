"use client";
import { startTestAction } from "@/actions/topik-actions";
import { cancelTestAction } from "@/actions/topik-actions";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { serverActionTimeOut } from "@/utils/time-out";
import { useTranslations } from "next-intl";
import { TestCutDown } from "./count-down";
import type { TopikLevelType } from ".keystone/types";

const ActionBar = ({
	level,
	no,
	isTesting,
	timeLeft,
	onSubmit,
	onReset,
	audioURL,
	isEnd,
}: {
	level: TopikLevelType;
	no: string;
	isTesting: boolean;
	timeLeft: number;
	onSubmit: () => void;
	onReset: () => void;
	audioURL?: string;
	isEnd?: boolean;
}) => {
	const tTopik = useTranslations("Topik");
	const [isHandleClickStartTestPending, handleClickStartTest] =
		useServerActionState(async () => {
			await startTestAction(level, no);
			await serverActionTimeOut();
		});

	const [isHandleClickCancelTestPending, handleClickCancelTest] =
		useServerActionState(async () => {
			await cancelTestAction(level, no);
			await serverActionTimeOut();
		});

	const handleSubmit = async () => {
		await handleClickCancelTest();
		await onSubmit();
	};

	const handleStart = async () => {
		await onReset();
		await handleClickStartTest();
	};

	const handleCancel = async () => {
		await handleClickCancelTest();
		await onReset();
	};

	const audioEl = audioURL && (
		<div>
			<audio
				autoPlay={false}
				preload={"Metadata"}
				controls
				controlsList="nodownload"
			>
				<track kind="captions" />
				<source src={audioURL} type="audio/mpeg" />
			</audio>
		</div>
	);

	return (
		<div className="w-full py-3">
			{isTesting ? (
				<div className="flex justify-between items-center flex-col gap-2">
					<TestCutDown timeLeft={timeLeft} onEnd={handleSubmit} />
					<div className="flex gap-2 flex-wrap">
						{!isEnd && (
							<button
								className="btn btn-sm btn-primary"
								type="button"
								onClick={handleSubmit}
							>
								{tTopik("submit")}
							</button>
						)}
						<button className="btn btn-sm" type="button" onClick={onReset}>
							{tTopik("reset")}
						</button>
						<button
							type="button"
							className="btn btn-sm btn-warning"
							disabled={isHandleClickCancelTestPending}
							onClick={handleCancel}
						>
							{isHandleClickCancelTestPending && (
								<span className="loading loading-spinner" />
							)}
							{tTopik("cancelTest")}
						</button>
					</div>
					{audioEl}
				</div>
			) : (
				<div className="flex gap-2 items-center justify-center flex-wrap">
					<button
						type="button"
						disabled={isHandleClickStartTestPending}
						className="btn btn-sm btn-secondary"
						onClick={handleStart}
					>
						{isHandleClickStartTestPending && (
							<span className="loading loading-spinner" />
						)}
						{tTopik("startTest")}
					</button>
					<button className="btn btn-sm" type="button" onClick={onReset}>
						{tTopik("reset")}
					</button>
					{audioEl}
				</div>
			)}
		</div>
	);
};

export { ActionBar };
