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
	const serverAction = useMemoizedFn(async (...args) => {
		setIsPending(true);
		try {
			return await action(...args);
		} finally {
			setIsPending(false);
		}
	}) as AsyncAction<T>;
	return [pending, serverAction] as const;
};

export { useServerActionState };
