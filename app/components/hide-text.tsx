import clsx from "clsx";
import type { ComponentProps, PropsWithChildren } from "react";

const HideText = ({
	hide = false,
	children,
	className,
	...props
}: PropsWithChildren<{ hide?: boolean } & ComponentProps<"span">>) => {
	return (
		<span
			className={clsx(
				"inline-block relative hover:before:opacity-0 before:transition-opacity px-0.5",
				hide && "after-backdrop-shadow cursor-pointer",
				className,
			)}
			{...props}
		>
			{children}
		</span>
	);
};

export { HideText };
