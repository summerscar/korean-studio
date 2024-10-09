import { type FC, type ReactNode, useEffect, useState } from "react";

const createCallable = <TPayload extends {}, TResult>(
	Comp: FC<
		TPayload & {
			call: { end: (payload: TResult) => void };
		}
	>,
) => {
	let $dispatch: ((key: number, payload: TPayload) => void) | undefined;
	const resolveMap = new Map<
		number,
		(value: TResult | PromiseLike<TResult>) => void
	>();
	let $key = 0;

	const call = (payload: TPayload) => {
		if (!$dispatch) {
			throw new Error("Root component not found");
		}

		const key = $key++;
		const promise = new Promise<TResult>((resolve) => {
			resolveMap.set(key, resolve);
		});
		$dispatch(key, payload);
		return promise;
	};

	const Root = () => {
		const [stack, setStack] = useState<
			{
				status: "active" | "inactive";
				key: number;
				payload: TPayload;
				end: (payload: TResult) => void;
			}[]
		>([]);

		useEffect(() => {
			$dispatch = (key, payload: TPayload) => {
				setStack((stack) => {
					return [
						...stack,
						{
							key,
							status: "active",
							payload,
							end: (res: TResult) => {
								setStack((stack) =>
									stack.map((s) => {
										if (s.key === key) {
											return { ...s, status: "inactive" };
										}
										return s;
									}),
								);
								resolveMap.get(key)?.(res);
							},
						},
					];
				});
			};

			return () => {
				$dispatch = undefined;
			};
		}, []);

		return (
			<>
				{stack.map(({ status, payload, key, end }) => {
					if (status === "active") {
						return <Comp key={key} {...payload} call={{ end }} />;
					}
					return null;
				})}
			</>
		);
	};

	return {
		call,
		Root,
	} as const;
};

export { createCallable };

// example
const TestButton = ({
	call,
	type,
	message,
}: {
	type: string;
	message: string;
	call: { end: (payload: string) => void };
}) => {
	const handleClick = () => {
		setTimeout(() => {
			call.end("test end");
		}, 2000);
	};

	return (
		<button onClick={handleClick} type="button">
			type: {type}, message: {message}
		</button>
	);
};

const callableButton = createCallable<
	{ type: string; message: string },
	string
>(TestButton);

// biome-ignore lint/correctness/noUnusedVariables: <explanation>
const { call, Root } = callableButton;
