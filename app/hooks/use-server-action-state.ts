import { useMemoizedFn } from "ahooks";
import { useState } from "react";

const useServerActionState = <T = unknown>(action: () => Promise<T>) => {
	const [pending, setIsPending] = useState(false);
	const serverAction = useMemoizedFn(async () => {
		setIsPending(true);
		try {
			return await action();
		} finally {
			setIsPending(false);
		}
	});
	return [pending, serverAction] as const;
};

export { useServerActionState };
