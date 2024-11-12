"use client";
import { useDevice } from "@/hooks/use-device";
import { useEffect } from "react";

const VConsole = () => {
	const { isTouchable } = useDevice();
	useEffect(() => {
		if (isTouchable) {
			let vConsole: { destroy: () => void };
			const script = document.createElement("script");
			script.src = "https://unpkg.com/vconsole@latest/dist/vconsole.min.js";
			script.async = true;
			script.onload = () => {
				vConsole = new window.VConsole();
			};
			document.body.appendChild(script);
			return () => {
				vConsole.destroy();
			};
		}
	}, [isTouchable]);
	return null;
};

export { VConsole };
