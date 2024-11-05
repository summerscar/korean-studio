"use client";
import { startTestAction } from "@/actions/topik-actions";
import { cancelTestAction } from "@/actions/topik-actions";
import { useServerActionState } from "@/hooks/use-server-action-state";
import { serverActionTimeOut, timeOut } from "@/utils/time-out";
import { TestCutDown } from "./count-down";
import type { TopikLevelType } from ".keystone/types";

const ActionBar = ({
	level,
	no,
	isTesting,
	timeLeft,
	onSubmit,
	onReset,
}: {
	level: TopikLevelType;
	no: string;
	isTesting: boolean;
	timeLeft: number;
	onSubmit: () => void;
	onReset: () => void;
}) => {
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

	return (
		<div>
			{isTesting ? (
				<div className="flex justify-between items-center">
					<div className="flex gap-2">
						<button
							className="btn btn-sm btn-primary"
							type="button"
							onClick={onSubmit}
						>
							submit
						</button>
						<button
							className="btn btn-sm btn-primary"
							type="button"
							onClick={onReset}
						>
							reset
						</button>
						<button
							type="button"
							className="btn btn-sm btn-warning"
							disabled={isHandleClickCancelTestPending}
							onClick={handleClickCancelTest}
						>
							{isHandleClickCancelTestPending && (
								<span className="loading loading-spinner" />
							)}
							取消测试
						</button>
					</div>
					<TestCutDown timeLeft={timeLeft} />
				</div>
			) : (
				<button
					type="button"
					disabled={isHandleClickStartTestPending}
					className="btn btn-sm btn-secondary"
					onClick={handleClickStartTest}
				>
					{isHandleClickStartTestPending && (
						<span className="loading loading-spinner" />
					)}
					开始测试
				</button>
			)}
		</div>
	);
};

export { ActionBar };
