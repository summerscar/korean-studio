import InfoIcon from "@/assets/svg/info.svg";
import { useDevice } from "@/hooks/use-device";
import { notoKR } from "@/utils/fonts";
import clsx from "clsx";

const Hangul = ({
	hangulRef,
	focusInput,
	isInputError,
	curInputIndex,
	hangul,
	qwerty,
}: {
	hangulRef: React.RefObject<HTMLDivElement | null>;
	focusInput: () => void;
	isInputError: boolean;
	curInputIndex: number;
	hangul: string;
	qwerty?: string;
}) => {
	const { isTouchable } = useDevice();

	/** 输入状态 style */
	const heightLightClass = (strIndex: number) =>
		clsx({
			"font-bold text-[color:var(--font-color-error)]":
				isInputError && curInputIndex === strIndex,
			"text-[color:var(--font-color-active)] font-bold":
				curInputIndex > strIndex,
		});

	return (
		<div
			className={clsx(
				notoKR.className,
				"relative inline-block cursor-pointer text-xl text-[color:var(--font-color-inactive)]",
			)}
			ref={hangulRef}
			onClick={focusInput}
		>
			{[...hangul].map((strItem, idx) => (
				<span
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={idx}
					className={clsx(heightLightClass(idx))}
				>
					{strItem}
				</span>
			))}
			{qwerty && (
				<div
					className={clsx(
						"absolute -right-9 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[1]",
						!isTouchable && "tooltip tooltip-top",
					)}
					data-tip={qwerty}
				>
					<InfoIcon
						className="opacity-60"
						width={20}
						height={20}
						viewBox="0 0 24 24"
					/>
				</div>
			)}
		</div>
	);
};

export { Hangul };
