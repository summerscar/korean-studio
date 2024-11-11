import { useEffect, useState } from "react";

export const useDevice = () => {
	const [isTouchable, setIsTouchable] = useState(false);

	useEffect(() => {
		const callback = () => {
			const touchable =
				/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) &&
				("ontouchstart" in window || navigator.maxTouchPoints > 0) &&
				window.matchMedia("(pointer: coarse)").matches;
			setIsTouchable(touchable);
		};
		callback();
		window.addEventListener("resize", callback);
		return () => window.removeEventListener("resize", callback);
	}, []);

	return { isTouchable } as const;
};
