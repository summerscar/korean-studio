"use client";
import { startTestAction } from "@/actions/topik-actions";
import { cancelTestAction } from "@/actions/topik-actions";
import type { TopikLevelType } from ".keystone/types";

const ActionBar = ({
	level,
	no,
	isTesting,
}: { level: TopikLevelType; no: string; isTesting: boolean }) => {
	const handleClickStartTest = () => {
		startTestAction(level, no);
	};
	const handleClickCancelTest = () => {
		cancelTestAction(level, no);
	};
	return (
		<>
			{isTesting ? (
				<button
					type="button"
					className="btn btn-error"
					onClick={handleClickCancelTest}
				>
					取消测试
				</button>
			) : (
				<button
					type="button"
					className="btn btn-success"
					onClick={handleClickStartTest}
				>
					开始测试
				</button>
			)}
		</>
	);
};

export { ActionBar };
