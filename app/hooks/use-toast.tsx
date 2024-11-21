"use client";
import { useMemoizedFn } from "ahooks";
import clsx from "clsx";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";

const createToast = ({
	type,
	message,
	delay = 3000,
}: {
	type: "success" | "error" | "info" | "warning";
	message: ReactNode;
	delay?: number;
}) => {
	const toastWrapper = getToastWrapper();
	const root = createRoot(toastWrapper);
	root.render(
		<div
			className={clsx("alert !text-white", {
				"alert-success": type === "success",
				"alert-error": type === "error",
				"alert-info": type === "info",
				"alert-warning": type === "warning",
			})}
		>
			{message}
		</div>,
	);
	let unmount = () => {
		root.render(null);
		root.unmount();
		unmount = () => {};
	};
	const timeout = setTimeout(() => unmount(), delay);
	return () => {
		clearTimeout(timeout);
		unmount();
	};
};

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

export { useToast, createToast };
