import { useMemoizedFn } from "ahooks";
import { useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type AsyncAction<T extends (...args: any[]) => Promise<any>> = (
	...args: Parameters<T>
) => ReturnType<T>;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const useServerActionState = <T extends (...args: any[]) => Promise<any>>(
	action: T,
) => {
	const [pending, setIsPending] = useState(false);
	const [result, setResult] = useState<Awaited<ReturnType<T>> | undefined>(
		undefined,
	);

	const serverAction = useMemoizedFn(async (...args) => {
		setIsPending(true);
		setResult(undefined);
		try {
			const res = await action(...args);
			setResult(res);
			return res;
		} finally {
			setIsPending(false);
		}
	}) as AsyncAction<T>;
	return [pending, serverAction, result] as const;
};

export { useServerActionState };
