import type { ErrorComponent } from "next/dist/client/components/error-boundary";

export const ErrorFallback: ErrorComponent = ({ error }) => {
	return (
		<div className="flex flex-col items-center gap-2 p-4">
			<span className="text-error">⚠️ Error</span>
			<p className="text-sm text-base-content/60">{error.message}</p>
		</div>
	);
};
