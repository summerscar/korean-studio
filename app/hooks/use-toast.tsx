import { useMemoizedFn } from "ahooks";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
// TODO: create callable
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
		toastWrapper.classList.add("toast", "toast-top", "toast-center");
		document.body.appendChild(toastWrapper);
	}
	const toastEl = document.createElement("div");
	toastEl.className = `alert alert-${type}`;

	toastEl.innerHTML = renderToString(message);
	toastWrapper?.appendChild(toastEl);
	setTimeout(() => {
		toastWrapper?.removeChild(toastEl);
	}, delay);
	return () => toastWrapper?.removeChild(toastEl);
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
