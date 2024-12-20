import { useEffect, useState } from "react";

let lastIsTouchable: boolean | undefined;

export const useDevice = () => {
	const [isTouchable, setIsTouchable] = useState(lastIsTouchable ?? false);

	useEffect(() => {
		const callback = () => {
			setIsTouchable(checkIsTouchable());
		};
		callback();
		window.addEventListener("resize", callback);
		return () => window.removeEventListener("resize", callback);
	}, []);

	return { isTouchable } as const;
};

export const checkIsTouchable = () => {
	const touchable = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	/* 		/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
		("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
		window.matchMedia("(pointer: coarse)").matches; */

	return (lastIsTouchable = touchable);
};
