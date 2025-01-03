"use client";
import { useMemoizedFn } from "ahooks";
import type { ReactNode } from "react";

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
	const toastEl = document.createElement("div");
	const { promise, resolve } = Promise.withResolvers();
	toastEl.className = `alert alert-${type} !text-white`;

	import("react-dom/server")
		.then((mod) => mod.renderToString)
		.then((renderToString) => {
			toastEl.innerHTML = renderToString(message);
			toastWrapper.appendChild(toastEl);
			resolve("");
		});

	let unmount = () => {
		promise.then(() => toastWrapper.removeChild(toastEl));
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
		toastWrapper.classList.add(
			"toast",
			"toast-top",
			"toast-center",
			"z-50",
			"pointer-events-none",
		);
		document.body.appendChild(toastWrapper);
	}
	if (document.fullscreenElement) {
		document.fullscreenElement.appendChild(toastWrapper);
	} else {
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
