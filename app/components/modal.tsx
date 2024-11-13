"use client";
import { createCallable } from "@/utils/callable";
import { useTranslations } from "next-intl";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type CallableModalProps = {
	type: "dialog" | "confirm";
	title?: string;
	message?: ReactNode;
	inputPlaceholder?: string;
	inputDefaultValue?: string;
};

type CallableModalReturn = string | undefined | boolean;

function CallableModal({
	call,
	title,
	message,
	type,
	inputPlaceholder,
	inputDefaultValue,
}: CallableModalProps & {
	call: { end: (payload?: CallableModalReturn) => void };
}) {
	const tModal = useTranslations("Modal");
	const modalRef = useRef<HTMLDialogElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [inputValue, setInputValue] = useState(inputDefaultValue || "");

	useEffect(() => {
		modalRef.current?.showModal();
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		const callback = () => {
			call.end();
		};
		modalRef.current?.addEventListener("close", callback);
		return () => {
			modalRef.current?.removeEventListener("close", callback);
		};
	}, [call.end]);

	const handleOK = () => {
		call.end(type === "dialog" ? inputValue : true);
	};

	const handleClose = () => {
		call.end(type === "dialog" ? undefined : false);
	};

	return createPortal(
		<dialog ref={modalRef} className="modal !z-40">
			<div className="modal-box">
				<button
					type="button"
					onClick={handleClose}
					className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
				>
					✕
				</button>
				<h3 className="font-bold text-lg">{title || tModal("confirm")}</h3>
				<p className="py-4">{message}</p>
				{type === "dialog" && (
					<input
						type="text"
						ref={inputRef}
						placeholder={inputPlaceholder}
						className="input input-bordered input-md w-full"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleOK();
							}
						}}
					/>
				)}
				<div className="flex justify-end gap-2 sm:gap-4 pt-4">
					<button
						className="btn btn-md btn-primary"
						type="button"
						onClick={handleOK}
					>
						{tModal("confirm")}
					</button>
					<button className="btn btn-md" type="button" onClick={handleClose}>
						{tModal("cancel")}
					</button>
				</div>
			</div>
			<div className="modal-backdrop">
				<button type="button" onClick={handleClose}>
					close
				</button>
			</div>
		</dialog>,
		document.body,
	);
}

const { Root, call } = createCallable<CallableModalProps, CallableModalReturn>(
	CallableModal,
);

export const TestModal = () => {
	const handleConfirmClick = async () => {
		const res = await call({
			type: "confirm",
			title: "Confirm???",
			message: "Are you sure?",
		});
		console.log("TestConfirm:", res);
	};

	const handleDialogClick = async () => {
		const res = await call({
			type: "dialog",
			message: "Input something",
			title: "Dialog",
			inputPlaceholder: "Input something",
		});
		console.log("TestModal:", res);
	};
	return (
		<>
			<button className="btn" type="button" onClick={handleConfirmClick}>
				Open Confirm Modal
			</button>
			<button className="btn" type="button" onClick={handleDialogClick}>
				Open Modal
			</button>
		</>
	);
};

export { Root as ModalRoot, call as callModal };
