import KoreanKeyBoardSVG from "@/assets/svg/korean-keyboard.svg";
import SettingIcon from "@/assets/svg/setting.svg";
import { useDevice } from "@/hooks/use-device";
import {
	isBackspace,
	isShift,
	isSpace,
	keyCodeToQwerty,
} from "@/utils/convert-input";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const KeyBoard = ({
	inputKeys,
	isInputFocused,
	drawerRef,
}: {
	inputKeys: Record<string, boolean>;
	isInputFocused: boolean;
	drawerRef: React.RefObject<{ open: () => void }>;
}) => {
	const { isTouchable } = useDevice();
	const tHome = useTranslations("Home");

	const inlineStyle = useMemo(() => {
		const activeColor = "var(--keyboard-active-color)";
		return Object.keys(inputKeys).reduce((prev, keyCode) => {
			return `${prev}.${keyCodeToQwerty(keyCode)} {fill: ${activeColor};}
		.shift {${isShift(keyCode) ? `fill: ${activeColor};` : ""}}
		.space {${isSpace(keyCode) ? `fill: ${activeColor};` : ""}}
		.backspace {${isBackspace(keyCode) ? `fill: ${activeColor};` : ""}}`;
		}, "");
	}, [inputKeys]);

	return (
		<div
			className={clsx(
				"drop-shadow-lg w-full sm:w-[80vw] md:w-[70vw] my-3 rounded-md sm:rounded-xl overflow-hidden relative",
			)}
		>
			<style>{inlineStyle}</style>
			<KoreanKeyBoardSVG
				viewBox="0 0 910 310"
				width={"100%"}
				height={"100%"}
				className="dark:invert-[0.8]"
			/>
			<div
				className={clsx(
					"transition-all select-none absolute top-0 left-0 w-full h-full bg-gray-400/75 dark:bg-gray-800/85 flex items-center justify-around sm:justify-center flex-col p-1 gap-0 sm:gap-8",
					isInputFocused ? "opacity-0 pointer-events-none" : "opacity-100",
				)}
			>
				{!isTouchable ? (
					<div className="text-3xl flex items-center">
						{tHome.rich("tipsEnter", {
							enter: () => <kbd className="kbd kbd-md mx-2">Enter</kbd>,
						})}
					</div>
				) : (
					<div className="text-xl flex items-center text-center">
						{tHome("tipsForMobile")}
					</div>
				)}
				<div className="flex flex-col items-center gap-2">
					<button
						className="btn btn-outline btn-sm"
						type="button"
						onClick={() => drawerRef.current.open()}
					>
						<SettingIcon className="size-5" />
						{tHome("viewList")}
					</button>
					{!isTouchable && (
						<div className="text-sm">
							tips: Try <kbd className="kbd kbd-xs">[</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">]</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">\</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">;</kbd>
							{" / "}
							<kbd className="kbd kbd-xs">'</kbd>.
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export { KeyBoard };
