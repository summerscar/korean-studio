"use client";

import { useRouter } from "next/navigation";

export default function ErrorPage({
	error,
	// reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const router = useRouter();
	return (
		<div className="flex flex-col items-center justify-center p-4 mx-auto">
			<div className="text-center space-y-6">
				<h1 className="text-4xl font-bold text-gray-900">⚠️ Error</h1>
				<p className="text-sm text-base-content/60">{error?.message}</p>
				<button
					type="button"
					onClick={() => router.replace("/")}
					className="px-6 py-2 btn"
				>
					To Home
				</button>
			</div>
		</div>
	);
}
