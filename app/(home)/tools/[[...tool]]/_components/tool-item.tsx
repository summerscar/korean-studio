"use client";
import NextIcon from "@/assets/svg/next.svg";
import { type FC, type ReactNode, useState } from "react";

const ToolItem = ({
	resolve,
	defaultValue,
	title,
	description,
}: Parameters<typeof useInput>[0] & {
	title?: ReactNode;
	description?: ReactNode;
} = {}) => {
	const [value, inputEl] = useInput({
		resolve,
		defaultValue,
	});

	return (
		<div className="flex flex-col gap-3 items-center">
			{title && <h1 className="text-2xl">{title}</h1>}
			{description && <p>{description}</p>}
			<div className="flex items-center">
				{inputEl}
				<NextIcon className="mx-6 h-6" />
				<input
					type="text"
					className="input input-bordered input-sm"
					value={value}
					readOnly
				/>
			</div>
		</div>
	);
};

const useInput = ({
	resolve,
	defaultValue,
}: {
	resolve?: (inputText: string | number) => string;
	defaultValue?: string;
} = {}) => {
	const [input, setInput] = useState(defaultValue || "");
	const [errorMsg, setErrorMsg] = useState("");
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
		setErrorMsg("");
	};

	const outputVal = () => {
		if (errorMsg) return "";
		try {
			return resolve ? resolve(input) : input;
		} catch (e) {
			setErrorMsg((e as Error).message);
			return "";
		}
	};
	return [
		outputVal(),
		// biome-ignore lint/correctness/useJsxKeyInIterable: <explanation>
		<div>
			<input
				type="text"
				className="input input-bordered input-sm"
				onChange={onChange}
				defaultValue={defaultValue}
			/>
			<p>{errorMsg}</p>
		</div>,
	] as const;
};

export { ToolItem };
