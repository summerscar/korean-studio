import { ClientOnly } from "@/components/client-only";
import { useSize } from "ahooks";
import React, { type ComponentProps, forwardRef } from "react";
import Confetti from "react-confetti";

export const SizedConfetti = forwardRef<
	HTMLCanvasElement,
	ComponentProps<typeof Confetti>
>((passedProps, ref) => {
	const { width, height } = useSize(() => document.querySelector("body")) || {};
	return (
		<ClientOnly>
			<Confetti width={width} height={height} {...passedProps} ref={ref} />
		</ClientOnly>
	);
});
