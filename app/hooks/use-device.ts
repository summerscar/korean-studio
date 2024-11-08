import { useEffect, useState } from "react";

export const useDevice = () => {
	const [isTouchable, setIsTouchable] = useState(false);

	useEffect(() => {
		const callback = () => {
			const canHover = window.matchMedia("(hover: hover)").matches;
			setIsTouchable(canHover);
		};
		callback();
		window.addEventListener("resize", callback);
		return () => window.removeEventListener("resize", callback);
	}, []);

	return { isTouchable } as const;
};
