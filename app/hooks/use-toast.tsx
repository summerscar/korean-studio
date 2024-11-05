"use client";
import { createCallable } from "@/utils/callable";
import { useMemoizedFn } from "ahooks";
import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { renderToString } from "react-dom/server";

const createToast = ({
	type,
	message,
	delay = 3000,
}: {
	type: "success" | "error" | "info" | "warning";
	message: ReactNode;
	delay?: number;
}) => {
	let toastWrapper = document.getElementById("toast");
	if (!toastWrapper) {
		toastWrapper = document.createElement("div");
		toastWrapper.id = "toast";
		toastWrapper.classList.add("toast", "toast-top", "toast-center", "z-50");
		document.body.appendChild(toastWrapper);
	}
	const toastEl = document.createElement("div");
	toastEl.className = `alert alert-${type}`;

	toastEl.innerHTML = renderToString(message);
	toastWrapper?.appendChild(toastEl);
	let unmount = () => {
		toastWrapper?.removeChild(toastEl);
		unmount = () => {};
	};
	const timeout = setTimeout(() => unmount(), delay);
	return () => {
		clearTimeout(timeout);
		unmount();
	};
};

export const createLoadingToast = (info: string) => {
	return createToast({
		type: "info",
		delay: 60 * 1000 * 5,
		message: (
			<div className="flex items-center">
				<span className="loading loading-spinner loading-sm mr-2" />
				{info}
			</div>
		),
	});
};

export const createSuccessToast = (info: string) => {
	return createToast({
		type: "success",
		message: <span>{info}</span>,
	});
};

export const createErrorToast = (info: string) => {
	return createToast({
		type: "error",
		message: <span>{info}</span>,
	});
};

const useToast = () => {
	const toast = useMemoizedFn(
		(message: ReactNode, type: Parameters<typeof createToast>[0]["type"]) => {
			createToast({ type, message, delay: 3000 });
		},
	);

	return {
		toast,
	};
};

// -----
// create callable toast
// -----

const ToastForCallable = ({
	type,
	message,
	call,
}: {
	type: string;
	message: ReactNode;
	call: { end: (payload: string) => void };
}) => {
	useEffect(() => {
		setTimeout(() => {
			call.end("toast destroyed");
		}, 3000);
	}, [call]);

	const getToastWrapper = () => {
		let toastWrapper = document.getElementById("toast");
		if (!toastWrapper) {
			toastWrapper = document.createElement("div");
			toastWrapper.id = "toast";
			toastWrapper.classList.add("toast", "toast-top", "toast-center", "z-50");
			document.body.appendChild(toastWrapper);
		}
		return toastWrapper;
	};

	return createPortal(
		<div className={`alert alert-${type}`}>{message}</div>,
		getToastWrapper(),
	);
};

const { call, Root } = createCallable<
	{ type: "success" | "error" | "info" | "warning"; message: string },
	string
>(ToastForCallable);

export { useToast, createToast, call as callToast, Root as ToastRoot };
