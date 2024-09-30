"use client";
import { startTestAction } from "@/actions/topik-actions";
import { cancelTestAction } from "@/actions/topik-actions";
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
	const handleClickStartTest = () => {
		// TODO: wait status
		startTestAction(level, no);
	};
	const handleClickCancelTest = () => {
		// TODO: wait status
		cancelTestAction(level, no);
	};

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
							className="btn btn-sm"
							onClick={handleClickCancelTest}
						>
							取消测试
						</button>
					</div>
					<TestCutDown timeLeft={timeLeft} />
				</div>
			) : (
				<button
					type="button"
					className="btn btn-sm btn-success"
					onClick={handleClickStartTest}
				>
					开始测试
				</button>
			)}
		</div>
	);
};

export { ActionBar };
