import clsx from "clsx";
import type { PropsWithChildren } from "react";

const HideText = ({
	hide = false,
	children,
}: PropsWithChildren<{ hide?: boolean }>) => {
	return (
		<span
			className={clsx(
				"inline-block relative cursor-pointer hover:before:opacity-0 before:transition-opacity",
				hide && "after-backdrop-shadow",
			)}
		>
			{children}
		</span>
	);
};

export { HideText };
