"use client";

import { useEventListener } from "ahooks";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const QuestionModal = ({ children }: { children: React.ReactNode }) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const router = useRouter();
	useEffect(() => {
		dialogRef.current?.showModal();
	}, []);

	useEventListener(
		"close",
		() => {
			router.back();
		},
		{ target: dialogRef },
	);

	return (
		<dialog ref={dialogRef} className="modal" id="question-modal">
			<div className="modal-box">
				<form method="dialog">
					{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
						✕
					</button>
				</form>
				{children}
			</div>
			<form method="dialog" className="modal-backdrop">
				{/* biome-ignore lint/a11y/useButtonType: <explanation> */}
				<button>close</button>
			</form>
		</dialog>
	);
};

export { QuestionModal };
