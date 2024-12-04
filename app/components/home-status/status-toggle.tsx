import DesktopIcon from "@/assets/svg/desktop.svg";
import TabletIcon from "@/assets/svg/tablet.svg";
import clsx from "clsx";

const StatusToggle = ({
	isInputStatus,
	onChange,
}: { isInputStatus: boolean; onChange: (value: boolean) => void }) => {
	return (
		<div className="flex absolute left-1/2 -translate-x-1/2 bottom-2 border border-slate-400/60 rounded-full px-1.5 py-0.5 gap-1.5 sm:px-2 sm:py-1 sm:gap-2">
			<DesktopIcon
				className={clsx(
					"cursor-pointer size-4 sm:size-5 transition-all duration-300",
					{
						"text-slate-400/80": !isInputStatus,
					},
				)}
				onClick={() => onChange(true)}
			/>
			<TabletIcon
				className={clsx(
					"cursor-pointer size-4 sm:size-5 transition-all duration-300",
					{
						"text-slate-400/80": isInputStatus,
					},
				)}
				onClick={() => onChange(false)}
			/>
			<div
				className={clsx(
					"absolute h-full w-[58%] top-0 bg-slate-400/30 rounded-full transition-all duration-300 -z-10",
					isInputStatus ? "left-0" : "left-[42%]",
				)}
			/>
		</div>
	);
};

export { StatusToggle };
